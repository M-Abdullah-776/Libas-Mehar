const { PrismaClient } = require('@prisma/client');

// Single shared instance avoids exhausting DB connections in dev with hot-reload
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
