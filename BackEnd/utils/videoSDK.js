const jwt = require("jsonwebtoken");

const API_KEY = process.env.VIDEOSDK_API_KEY;
const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

/**
 * Generates a participant token — used for joining rooms from the browser.
 * permissions: allow_join + allow_mod
 */
const generateToken = () => {
  // Debug logging
  console.log('[VideoSDK] API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'UNDEFINED');
  console.log('[VideoSDK] SECRET_KEY:', SECRET_KEY ? `${SECRET_KEY.substring(0, 10)}...` : 'UNDEFINED');
  console.log('[VideoSDK] SECRET_KEY type:', typeof SECRET_KEY);
  console.log('[VideoSDK] SECRET_KEY length:', SECRET_KEY ? SECRET_KEY.length : 0);
  
  if (!SECRET_KEY) {
    throw new Error('VIDEOSDK_SECRET_KEY is not defined in environment variables');
  }
  
  const payload = {
    apikey: API_KEY,
    permissions: ["allow_join", "allow_mod"],
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "120m", algorithm: "HS256" });
};

/**
 * Generates a server-side token — used for REST API calls (recording start/stop, room creation).
 * permissions: allow_join + allow_mod + allow_stream (required for recording API)
 */
const generateServerToken = () => {
  const payload = {
    apikey: API_KEY,
    permissions: ["allow_join", "allow_mod", "allow_stream"],
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "120m", algorithm: "HS256" });
};

module.exports = { generateToken, generateServerToken, API_KEY };