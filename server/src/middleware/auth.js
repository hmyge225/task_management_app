const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé: token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Non autorisé: token invalide' });
  }
}

module.exports = authMiddleware;


