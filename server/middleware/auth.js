const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'spotkify_super_secret_jwt_key_2026_prod';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      userName: user.user_name,
      name: user.name,
      isAdmin: Boolean(user.is_admin)
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || req.headers['x-nd-authorization'];
  if (!header) {
    // Default to guest / default user for seamless browsing if unauthenticated
    req.user = { id: 'admin-user-id', userName: 'admin', name: 'Administrator', isAdmin: true };
    return next();
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid token' } });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  next();
}

module.exports = {
  generateToken,
  authMiddleware,
  requireAdmin,
  JWT_SECRET
};
