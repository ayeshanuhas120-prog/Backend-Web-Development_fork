const bcrypt = require('bcryptjs');
const users = require('../repositories/userRepository');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await users.findByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('Email already registered');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await users.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });
    return safeUser(user);
  } catch (error) {
    if (error && error.code === 'P2002') {
      const conflict = new Error('Email already registered');
      conflict.code = 'EMAIL_EXISTS';
      throw conflict;
    }
    throw error;
  }
}

async function login({ email, password }) {
  const user = await users.findByEmail(normalizeEmail(email));
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? safeUser(user) : null;
}

module.exports = { register, login };
