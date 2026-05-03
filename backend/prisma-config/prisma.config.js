const path = require('path');

/**
 * Prisma 7 Configuration - FIX DEFINITIVO
 * Forçamos a URL aqui para que o 'npx prisma generate' funcione.
 */
module.exports = {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'file:' + path.join(__dirname, 'prisma', 'dev.db')
  }
};
