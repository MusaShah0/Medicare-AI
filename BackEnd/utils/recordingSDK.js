const axios = require('axios')
const { generateServerToken } = require('./videoSDK')

const VIDEOSDK_API_BASE = 'https://api.videosdk.live/v2'

const isLocalhost = () =>
  !process.env.WEBHOOK_BASE_URL ||
  process.env.WEBHOOK_BASE_URL.includes('localhost') ||
  process.env.WEBHOOK_BASE_URL.includes('127.0.0.1')

/**
 * Start cloud recording for a VideoSDK room.
 * Retries up to 5 times with 5s between attempts to handle the
 * "No active session found" 403 that occurs when the WebRTC session
 * hasn't fully established on VideoSDK's servers yet.
 */
const startRoomRecording = async (roomId, appointmentId) => {
  if (!process.env.WEBHOOK_BASE_URL) {
    throw new Error('WEBHOOK_BASE_URL environment variable is required')
  }

  if (isLocalhost()) {
    console.warn('[Notes] ⚠️  WEBHOOK_BASE_URL is localhost — webhooks will not be delivered.')
    console.warn('[Notes] ⚠️  Run: ngrok http 4000  then set WEBHOOK_BASE_URL in BackEnd/.env')
    console.warn('[Notes] ⚠️  Polling fallback will be used after meeting ends.')
  }

  const token = generateServerToken()
  const maxAttempts = 5
  const retryDelayMs = 5000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await axios.post(
        `${VIDEOSDK_API_BASE}/recordings/start`,
        {
          roomId,
          webhookUrl: `${process.env.WEBHOOK_BASE_URL}/webhook/videosdk`,
          config: {
            layout: { type: 'SPOTLIGHT', priority: 'SPEAKER', gridSize: 2 },
            theme: 'DARK',
            mode: 'audio-and-video',
            quality: 'high',
            orientation: 'landscape'
          }
        },
        {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
          timeout: 10000
        }
      )
      console.log(`[Notes] Recording started for roomId: ${roomId}`)
      return // success
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.message || err.message

      // Already recording — not an error
      if (status === 400 && msg.toLowerCase().includes('already')) {
        console.log(`[Notes] Recording already active for roomId: ${roomId}`)
        return
      }

      // 403 "No active session" — WebRTC not ready yet, retry
      if (status === 403 && attempt < maxAttempts) {
        console.log(`[Notes] Recording not ready (attempt ${attempt}/${maxAttempts}), retrying in ${retryDelayMs / 1000}s...`)
        await new Promise(r => setTimeout(r, retryDelayMs))
        continue
      }

      console.error(`[Notes] Recording start failed after ${attempt} attempt(s) — HTTP ${status}: ${msg}`)
      throw err
    }
  }
}

const stopRoomRecording = async (roomId) => {
  const token = generateServerToken()
  try {
    await axios.post(
      `${VIDEOSDK_API_BASE}/recordings/stop`,
      { roomId },
      {
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        timeout: 10000
      }
    )
    console.log(`[Notes] Recording stopped for roomId: ${roomId}`)
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 404) return
    console.error(`[Notes] Recording stop failed for roomId ${roomId}:`, err.message)
  }
}

/**
 * Poll VideoSDK recordings API until a completed recording appears for this room.
 * Used as a fallback when WEBHOOK_BASE_URL is localhost.
 *
 * VideoSDK composite recording response shape:
 * { data: [{ meetingId, file: { fileUrl, meta: { duration } } }] }
 *
 * @param {string} roomId
 * @param {number} maxWaitMs   - max time to poll (default 10 minutes)
 * @param {number} intervalMs  - poll interval (default 20 seconds)
 * @returns {Promise<{fileUrl: string, duration: number} | null>}
 */
const pollForRecording = async (roomId, maxWaitMs = 10 * 60 * 1000, intervalMs = 20000) => {
  const deadline = Date.now() + maxWaitMs
  console.log(`[Notes] Polling VideoSDK for recording — roomId: ${roomId}`)

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, intervalMs))

    try {
      const token = generateServerToken()

      // Composite recordings endpoint
      const res = await axios.get(
        `${VIDEOSDK_API_BASE}/recordings?roomId=${roomId}`,
        {
          headers: { Authorization: token },
          timeout: 10000
        }
      )

      const recordings = res.data?.data || []

      // Find a recording that has a fileUrl (means processing is complete)
      const done = recordings.find(r =>
        (r.roomId === roomId || r.meetingId === roomId) &&
        r.file?.fileUrl
      )

      if (done) {
        const fileUrl  = done.file.fileUrl
        const duration = done.file?.meta?.duration || done.duration || 0
        console.log(`[Notes] ✅ Recording found via polling — duration: ${duration}s`)
        return { fileUrl, duration }
      }

      console.log(`[Notes] Recording not ready yet (${recordings.length} record(s) found), checking again in ${intervalMs / 1000}s...`)
    } catch (err) {
      console.error(`[Notes] Poll request failed:`, err.response?.data || err.message)
    }
  }

  console.error(`[Notes] Polling timed out — no completed recording found for roomId: ${roomId}`)
  return null
}

module.exports = { startRoomRecording, stopRoomRecording, pollForRecording, isLocalhost }
