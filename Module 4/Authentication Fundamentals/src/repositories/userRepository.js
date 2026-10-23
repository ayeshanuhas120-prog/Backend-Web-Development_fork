const prisma = require('../db/prisma');

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser(data) {
  return prisma.user.create({ data });
}

module.exports = { findByEmail, createUser };
