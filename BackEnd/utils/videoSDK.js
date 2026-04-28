const jwt = require("jsonwebtoken");

const API_KEY = process.env.VIDEOSDK_API_KEY;
const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

/**
 * Generates a participant token — used for joining rooms from the browser.
 * permissions: allow_join + allow_mod
 */
const generateToken = () => {
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