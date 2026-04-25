const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const db = new Database(dbPath);

const users = db.prepare('SELECT email, role FROM User ORDER BY createdAt DESC LIMIT 5').all();
console.log(JSON.stringify(users, null, 2));
