const jwt = require('jsonwebtoken')

const Patient_Check = async (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(401).send('Login Required')
  }
  try {
    const decoded = jwt.verify(req.cookies.token, process.env.P_SecretKey)
    req.PatientId = decoded.id
    req.userRole  = 'patient'
    next()
  } catch (error) {
    return res.status(401).send('Unauthorized')
  }
}

module.exports = Patient_Check
