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
    console.error('camps route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT c.camp_id, c.bank_id, c.camp_name, c.location,
            TO_CHAR(c.camp_date, 'YYYY-MM-DD') AS camp_date,
            c.target_donors, c.status, bb.bank_name
       FROM camp c
       JOIN blood_bank bb ON c.bank_id = bb.bank_id
      ORDER BY c.camp_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT bank_id, bank_name FROM blood_bank ORDER BY bank_name`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json({ banks: result.rows });
}));

router.post('/report', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `BEGIN pkg_blood_bank.generate_camp_report(:p_camp_id, :p_total_donors, :p_total_units); END;`,
    {
      p_camp_id:      { val: Number(req.body.camp_id), type: oracledb.NUMBER },
      p_total_donors: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_total_units:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
    { autoCommit: false }
  );
  res.json({
    camp_id:      Number(req.body.camp_id),
    total_donors: result.outBinds.p_total_donors,
    total_units:  result.outBinds.p_total_units,
  });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { bank_id, camp_name, location, camp_date, target_donors, status } = req.body;
  const result = await conn.execute(
    `INSERT INTO camp (camp_id, bank_id, camp_name, location, camp_date, target_donors, status)
     VALUES (seq_camp.NEXTVAL, :bank_id, :camp_name, :location, :camp_date, :target_donors, :status)
     RETURNING camp_id INTO :new_id`,
    {
      bank_id:       { val: Number(bank_id), type: oracledb.NUMBER },
      camp_name:     { val: camp_name, type: oracledb.STRING },
      location:      { val: location || null, type: oracledb.STRING },
      camp_date:     { val: camp_date ? new Date(camp_date) : new Date(), type: oracledb.DATE },
      target_donors: { val: Number(target_donors) || null, type: oracledb.NUMBER },
      status:        { val: status || 'SCHEDULED', type: oracledb.STRING },
      new_id:        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ camp_id: result.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { bank_id, camp_name, location, camp_date, target_donors, status } = req.body;
  const result = await conn.execute(
    `UPDATE camp SET
       bank_id       = :bank_id,
       camp_name     = :camp_name,
       location      = :location,
       camp_date     = :camp_date,
       target_donors = :target_donors,
       status        = :status
     WHERE camp_id = :id`,
    {
      bank_id:       { val: Number(bank_id), type: oracledb.NUMBER },
      camp_name:     { val: camp_name, type: oracledb.STRING },
      location:      { val: location || null, type: oracledb.STRING },
      camp_date:     { val: camp_date ? new Date(camp_date) : new Date(), type: oracledb.DATE },
      target_donors: { val: Number(target_donors) || null, type: oracledb.NUMBER },
      status:        { val: status || 'SCHEDULED', type: oracledb.STRING },
      id:            { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Camp not found' });
  res.json({ camp_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM camp WHERE camp_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Camp not found' });
  res.json({ camp_id: Number(req.params.id) });
}));

module.exports = router;
