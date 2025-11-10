import jwt from 'jsonwebtoken';

const ROLE_PERMISSIONS = {
  admin: ['redesign:create'],
  designer: ['redesign:create'],
  guest: [],
};

function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    req.user = payload;

    const role = payload.role || 'guest';
    if (!hasPermission(role, 'redesign:create')) {
      return res.status(403).json({ message: 'You do not have permission to redesign rooms.' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
