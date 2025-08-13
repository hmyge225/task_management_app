function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Ressource non trouvée' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Erreur interne du serveur' });
}

module.exports = { notFoundHandler, errorHandler };


