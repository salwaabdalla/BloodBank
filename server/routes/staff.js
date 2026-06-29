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
    console.error('staff route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT s.staff_id, s.bank_id, s.first_name, s.last_name, s.role, s.phone,
            TO_CHAR(s.hire_date, 'YYYY-MM-DD') AS hire_date,
            bb.bank_name
       FROM staff s
       JOIN blood_bank bb ON s.bank_id = bb.bank_id
      ORDER BY s.staff_id`,
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

router.post('/', (req, res) => run(res, async (conn) => {
  const { bank_id, first_name, last_name, role, phone, hire_date } = req.body;
  const result = await conn.execute(
    `INSERT INTO staff (staff_id, bank_id, first_name, last_name, role, phone, hire_date)
     VALUES (seq_staff.NEXTVAL, :bank_id, :first_name, :last_name, :role, :phone, :hire_date)
     RETURNING staff_id INTO :new_id`,
    {
      bank_id:    { val: Number(bank_id), type: oracledb.NUMBER },
      first_name: { val: first_name, type: oracledb.STRING },
      last_name:  { val: last_name, type: oracledb.STRING },
      role:       { val: role, type: oracledb.STRING },
      phone:      { val: phone || null, type: oracledb.STRING },
      hire_date:  { val: hire_date ? new Date(hire_date) : new Date(), type: oracledb.DATE },
      new_id:     { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ staff_id: result.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { bank_id, first_name, last_name, role, phone, hire_date } = req.body;
  const result = await conn.execute(
    `UPDATE staff SET
       bank_id    = :bank_id,
       first_name = :first_name,
       last_name  = :last_name,
       role       = :role,
       phone      = :phone,
       hire_date  = :hire_date
     WHERE staff_id = :id`,
    {
      bank_id:    { val: Number(bank_id), type: oracledb.NUMBER },
      first_name: { val: first_name, type: oracledb.STRING },
      last_name:  { val: last_name, type: oracledb.STRING },
      role:       { val: role, type: oracledb.STRING },
      phone:      { val: phone || null, type: oracledb.STRING },
      hire_date:  { val: hire_date ? new Date(hire_date) : new Date(), type: oracledb.DATE },
      id:         { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Staff member not found' });
  res.json({ staff_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM staff WHERE staff_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Staff member not found' });
  res.json({ staff_id: Number(req.params.id) });
}));

module.exports = router;
