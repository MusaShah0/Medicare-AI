const jwt = require('jsonwebtoken')

const Doctor_Check = async (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(401).send('Login Required')
  }
  try {
    const decoded = jwt.verify(req.cookies.token, process.env.SecretKey)
    req.doctorId = decoded.id
    req.doctor   = decoded
    req.userRole = 'doctor'
    next()
  } catch (error) {
    return res.status(401).send('Unauthorized')
  }
}

module.exports = Doctor_Check
