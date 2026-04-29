import path from 'path';
import { defineConfig } from 'prisma/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db');

export default defineConfig({
  earlyAccess: true,
  schema: path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
  datasource: {
    url: `file:${dbPath}`,
  },
  migrate: {
    adapter: () => new PrismaBetterSqlite3({ url: dbPath }),
  },
});
