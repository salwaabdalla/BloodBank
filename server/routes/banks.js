const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

const run = async (res, fn) => {
  let conn;
  try {
    conn = await getConnection();
    await fn(conn, res);
  } catch (err) {
    console.error('banks route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT bank_id, bank_name, address, city, phone, email, is_active
       FROM blood_bank ORDER BY bank_id`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { bank_name, address, city, phone, email, is_active } = req.body;
  const result = await conn.execute(
    `INSERT INTO blood_bank (bank_id, bank_name, address, city, phone, email, is_active)
     VALUES (seq_blood_bank.NEXTVAL, :bank_name, :address, :city, :phone, :email, :is_active)
     RETURNING bank_id INTO :new_id`,
    {
      bank_name: { val: bank_name, type: oracledb.STRING },
      address:   { val: address || null, type: oracledb.STRING },
      city:      { val: city || null, type: oracledb.STRING },
      phone:     { val: phone || null, type: oracledb.STRING },
      email:     { val: email || null, type: oracledb.STRING },
      is_active: { val: is_active || 'Y', type: oracledb.STRING },
      new_id:    { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ bank_id: result.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { bank_name, address, city, phone, email, is_active } = req.body;
  const result = await conn.execute(
    `UPDATE blood_bank SET
       bank_name = :bank_name,
       address   = :address,
       city      = :city,
       phone     = :phone,
       email     = :email,
       is_active = :is_active
     WHERE bank_id = :id`,
    {
      bank_name: { val: bank_name, type: oracledb.STRING },
      address:   { val: address || null, type: oracledb.STRING },
      city:      { val: city || null, type: oracledb.STRING },
      phone:     { val: phone || null, type: oracledb.STRING },
      email:     { val: email || null, type: oracledb.STRING },
      is_active: { val: is_active || 'Y', type: oracledb.STRING },
      id:        { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Bank not found' });
  res.json({ bank_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM blood_bank WHERE bank_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Bank not found' });
  res.json({ bank_id: Number(req.params.id) });
}));

module.exports = router;
