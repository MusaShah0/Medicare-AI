const jwt = require("jsonwebtoken");

// Get these from your VideoSDK Console
const API_KEY = "459d9d71-647a-4c6e-a2c2-b50e0a856c9f";
const SECRET_KEY = "5144cb66d6122755f853ec9338177530758ab24fff2a9523e42910e0c22f62ec";

const generateToken = () => {
  const options = { 
    expiresIn: "120m", 
    algorithm: "HS256" 
  };
  
  const payload = {
    apikey: API_KEY,
    permissions: ["allow_join", "allow_mod"], // Permissions for the user
  };

  return jwt.sign(payload, SECRET_KEY, options);
};

module.exports = { generateToken, API_KEY };