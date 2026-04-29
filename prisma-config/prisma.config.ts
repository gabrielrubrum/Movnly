// Prisma config file — apenas para CLI (db push/generate)
// O runtime usa o PrismaService com better-sqlite3 adapter diretamente
import path from 'path';
import { defineConfig } from 'prisma/config';

const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db');

export default defineConfig({
  schema: path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
  datasource: {
    url: `file:${dbPath}`,
  },
});
