const jwt = require('jsonwebtoken')

/**
 * Tries to identify the caller as either a doctor or a patient
 * by verifying whichever JWT cookie is present.
 * Sets req.userId, req.userRole ('doctor' | 'patient'), req.doctorId / req.PatientId
 * for downstream use.
 */
const AnyUser_Check = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ status: 0, msg: 'Login required' })

  // Try doctor secret first
  try {
    const decoded = jwt.verify(token, process.env.SecretKey)
    req.userId = decoded.id
    req.doctorId = decoded.id
    req.userRole = 'doctor'
    return next()
  } catch (_) {}

  // Try patient secret
  try {
    const decoded = jwt.verify(token, process.env.P_SecretKey)
    req.userId = decoded.id
    req.PatientId = decoded.id
    req.userRole = 'patient'
    return next()
  } catch (_) {}

  return res.status(401).json({ status: 0, msg: 'Unauthorized' })
}

module.exports = AnyUser_Check
