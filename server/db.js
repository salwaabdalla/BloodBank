require('dotenv').config();
const oracledb = require('oracledb');

let pool;

async function initPool() {
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  });
  console.log('Oracle connection pool created');
}

async function getConnection() {
  if (!pool) throw new Error('Pool not initialized. Call initPool() first.');
  return pool.getConnection();
}

async function closePool() {
  if (pool) {
    await pool.close(0);
    console.log('Oracle connection pool closed');
  }
}

module.exports = { initPool, getConnection, closePool };
