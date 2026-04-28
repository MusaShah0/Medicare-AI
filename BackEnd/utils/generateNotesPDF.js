const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const notesDir = path.resolve(__dirname, '../uploads/notes')
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true })

/**
 * Generates a branded PDF consultation summary.
 *
 * @param {Object} note                 - MeetingNote document (note.summary contains the text)
 * @param {Object} populatedAppointment - Appointment with doctor_id, patient_id, sechdule_Id populated
 * @returns {Promise<string>}           - Absolute path to the generated PDF
 */
const generateNotesPDF = (note, populatedAppointment) => {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!note || !note.summary) {
      return reject(new Error('Note or summary is missing'))
    }
    if (!populatedAppointment || !populatedAppointment._id) {
      return reject(new Error('Appointment is missing or invalid'))
    }
    if (!populatedAppointment.doctor_id || !populatedAppointment.patient_id) {
      return reject(new Error('Appointment missing doctor or patient information'))
    }

    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const outputPath = path.join(notesDir, `${populatedAppointment._id}-notes.pdf`)
      const writeStream = fs.createWriteStream(outputPath)

      // Handle write stream errors
      writeStream.on('error', (err) => {
        doc.end()
        reject(new Error(`PDF write error: ${err.message}`))
      })

      doc.pipe(writeStream)

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 72).fill('#1e40af')
    doc.fillColor('#ffffff')
      .fontSize(22).font('Helvetica-Bold').text('MediCare AI', 50, 18)
    doc.fontSize(11).font('Helvetica').text('Meeting Summary', 50, 47)

    doc.moveDown(3.5)

    // ── Metadata ──
    const schedule = populatedAppointment.sechdule_Id
    const dateStr = schedule?.date
      ? new Date(schedule.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : 'N/A'
    const timeStr = schedule?.startTime && schedule?.endTime
      ? `${schedule.startTime} – ${schedule.endTime}`
      : ''

    doc.fillColor('#1e293b').fontSize(10).font('Helvetica')
    doc.text(`Date:      ${dateStr}${timeStr ? '  ·  ' + timeStr : ''}`)
    doc.text(`Doctor:    Dr. ${populatedAppointment.doctor_id.first_Name} ${populatedAppointment.doctor_id.last_Name}`)
    doc.text(`Patient:   ${populatedAppointment.patient_id.first_Name} ${populatedAppointment.patient_id.last_Name}`)

    doc.moveDown(0.8)
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#cbd5e1').lineWidth(1).stroke()
    doc.moveDown(1)

    // ── Summary sections ──
    // Groq returns sections formatted as **Heading**\nbody text
    // Split on **...** markers and render each as styled heading + body
    const summaryText = note.summary || 'Summary not available.'
    const parts = summaryText.split(/\*\*(.+?)\*\*/)
    // parts alternates: ['preamble', 'heading', 'body', 'heading', 'body', ..., 'disclaimer']

    if (parts.length < 3) {
      // Model didn't follow format — render raw text
      doc.fillColor('#334155').fontSize(11).font('Helvetica').text(summaryText, { lineGap: 5 })
    } else {
      for (let i = 1; i < parts.length - 1; i += 2) {
        const heading = parts[i].trim()
        const body    = parts[i + 1].trim()
        if (!heading) continue

        doc.fillColor('#1e40af').fontSize(12).font('Helvetica-Bold').text(heading)
        doc.moveDown(0.25)
        doc.fillColor('#334155').fontSize(11).font('Helvetica').text(body, { lineGap: 4 })
        doc.moveDown(0.9)
      }

      // Disclaimer (last part after the final ** block)
      const disclaimer = parts[parts.length - 1].trim()
      if (disclaimer) {
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
          .strokeColor('#e2e8f0').lineWidth(1).stroke()
        doc.moveDown(0.5)
        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Oblique')
          .text(disclaimer, { lineGap: 3 })
      }
    }

    // ── Footer ──
    const footerY = doc.page.height - 40
    doc.moveTo(50, footerY - 10).lineTo(doc.page.width - 50, footerY - 10)
      .strokeColor('#cbd5e1').lineWidth(1).stroke()
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
      .text(
        `Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })}  ·  MediCare AI  ·  For personal records only`,
        50, footerY,
        { align: 'center', width: doc.page.width - 100 }
      )

    doc.end()
    writeStream.on('finish', () => {
      // Verify PDF was actually created
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        reject(new Error('PDF file was not created or is empty'))
      } else {
        resolve(outputPath)
      }
    })
    // error handler already registered above — do not add a second one
  } catch (err) {
    reject(new Error(`PDF generation error: ${err.message}`))
  }
  })
}

module.exports = { generateNotesPDF }
