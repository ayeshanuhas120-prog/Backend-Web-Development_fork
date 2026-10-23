const express = require('express');
const { register, login } = require('../services/authService');

const router = express.Router();

function validString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (![name, email, password].every(validString)) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required' } });
  }
  try {
    const user = await register({ name: name.trim(), email, password });
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!validString(email) || !validString(password)) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Email and password are required' } });
  }
  try {
    const user = await login({ email, password });
    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
