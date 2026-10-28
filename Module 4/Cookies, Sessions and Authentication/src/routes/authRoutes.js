const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: 'lax',
  secure: String(process.env.COOKIE_SECURE).toLowerCase() === 'true',
  path: '/',
};

function authError(res) {
  return res.status(401).json({
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  });
}

router.post('/login', async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) return authError(res);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return authError(res);

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return authError(res);

    // Replace any existing session on this browser before issuing a new one.
    const oldSid = req.signedCookies?.sid;
    if (oldSid && typeof oldSid === 'string') sessionStore.destroy(oldSid);

    const { sid, expiresAt } = sessionStore.create(user.id);
    res.cookie('sid', sid, {
      ...cookieOptions,
      maxAge: Math.max(0, expiresAt - Date.now()),
    });

    return res.status(200).json({
      data: {
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      sessionStore.destroy(req.signedCookies.sid);
      res.clearCookie('sid', cookieOptions);
      return res.status(401).json({
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }

    return res.status(200).json({ data: { user } });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  try {
    const sid = req.signedCookies?.sid;
    if (sid && typeof sid === 'string') sessionStore.destroy(sid);

    res.clearCookie('sid', cookieOptions);
    return res.status(200).json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
