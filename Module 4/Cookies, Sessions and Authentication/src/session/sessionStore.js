const { randomBytes } = require('node:crypto');

const sessions = new Map();

const configuredTtl = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
const SESSION_TTL_MS =
  Number.isFinite(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : 60 * 60 * 1000;

function create(userId) {
  const sid = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;

  // Keep only the user's id and expiry on the server; never store credentials.
  sessions.set(sid, { userId, expiresAt });
  return { sid, expiresAt };
}

function get(sid) {
  if (!sid || typeof sid !== 'string') return null;

  const session = sessions.get(sid);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sid);
    return null;
  }

  return { ...session };
}

function destroy(sid) {
  if (typeof sid === 'string') sessions.delete(sid);
}

module.exports = { create, get, destroy, SESSION_TTL_MS };
