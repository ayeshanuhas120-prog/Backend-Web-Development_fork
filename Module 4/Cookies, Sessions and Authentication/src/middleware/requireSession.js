const sessionStore = require('../session/sessionStore');

module.exports = function requireSession(req, res, next) {
  const sid = req.signedCookies && req.signedCookies.sid;

  // cookie-parser sets a signed cookie to false when its signature is invalid.
  if (!sid || typeof sid !== 'string') {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  const session = sessionStore.get(sid);
  if (!session) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  req.session = session;
  next();
};
