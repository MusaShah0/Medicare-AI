const jwt = require("jsonwebtoken");

const API_KEY = "459d9d71-647a-4c6e-a2c2-b50e0a856c9f";
const SECRET_KEY = "5144cb66d6122755f853ec9338177530758ab24fff2a9523e42910e0c22f62ec";

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