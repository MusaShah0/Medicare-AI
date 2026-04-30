const jwt = require('jsonwebtoken');

const AdminMiddleware = (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin_secret_key');
    if (payload.role !== 'admin') throw new Error('Not admin');
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session.' });
  }
};

module.exports = AdminMiddleware;
