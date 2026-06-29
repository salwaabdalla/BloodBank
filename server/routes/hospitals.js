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
    console.error('hospitals route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT hospital_id, hospital_name, address, city, phone, email, hospital_type
       FROM hospital ORDER BY hospital_id`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { hospital_name, address, city, phone, email, hospital_type } = req.body;
  const result = await conn.execute(
    `INSERT INTO hospital (hospital_id, hospital_name, address, city, phone, email, hospital_type)
     VALUES (seq_hospital.NEXTVAL, :hospital_name, :address, :city, :phone, :email, :hospital_type)
     RETURNING hospital_id INTO :new_id`,
    {
      hospital_name: { val: hospital_name, type: oracledb.STRING },
      address:       { val: address || null, type: oracledb.STRING },
      city:          { val: city || null, type: oracledb.STRING },
      phone:         { val: phone || null, type: oracledb.STRING },
      email:         { val: email || null, type: oracledb.STRING },
      hospital_type: { val: hospital_type || 'PUBLIC', type: oracledb.STRING },
      new_id:        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ hospital_id: result.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { hospital_name, address, city, phone, email, hospital_type } = req.body;
  const result = await conn.execute(
    `UPDATE hospital SET
       hospital_name = :hospital_name,
       address       = :address,
       city          = :city,
       phone         = :phone,
       email         = :email,
       hospital_type = :hospital_type
     WHERE hospital_id = :id`,
    {
      hospital_name: { val: hospital_name, type: oracledb.STRING },
      address:       { val: address || null, type: oracledb.STRING },
      city:          { val: city || null, type: oracledb.STRING },
      phone:         { val: phone || null, type: oracledb.STRING },
      email:         { val: email || null, type: oracledb.STRING },
      hospital_type: { val: hospital_type || 'PUBLIC', type: oracledb.STRING },
      id:            { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Hospital not found' });
  res.json({ hospital_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM hospital WHERE hospital_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Hospital not found' });
  res.json({ hospital_id: Number(req.params.id) });
}));

module.exports = router;
