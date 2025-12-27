const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString });
module.exports = pool;
