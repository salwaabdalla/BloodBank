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
    console.error('tests route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT mt.test_id, mt.donation_id, mt.test_type,
            TO_CHAR(mt.test_date, 'YYYY-MM-DD') AS test_date,
            mt.result, mt.tested_by,
            d.first_name || ' ' || d.last_name       AS donor_name,
            TO_CHAR(dn.donation_date, 'DD-Mon-YYYY') AS donation_date
       FROM medical_test mt
       JOIN donation dn ON mt.donation_id = dn.donation_id
       JOIN donor    d  ON dn.donor_id    = d.donor_id
      ORDER BY mt.test_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT dn.donation_id,
            d.first_name || ' ' || d.last_name AS donor_name,
            bt.blood_group,
            TO_CHAR(dn.donation_date, 'DD-Mon-YYYY') AS donation_date
       FROM donation dn
       JOIN donor     d  ON dn.donor_id     = d.donor_id
       JOIN blood_type bt ON dn.blood_type_id = bt.blood_type_id
      ORDER BY dn.donation_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json({ donations: result.rows });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { donation_id, test_type, test_date, result: testResult, tested_by } = req.body;
  const newResult = await conn.execute(
    `INSERT INTO medical_test (test_id, donation_id, test_type, test_date, result, tested_by)
     VALUES (seq_medical_test.NEXTVAL, :donation_id, :test_type, :test_date, :result, :tested_by)
     RETURNING test_id INTO :new_id`,
    {
      donation_id: { val: Number(donation_id), type: oracledb.NUMBER },
      test_type:   { val: test_type,           type: oracledb.STRING },
      test_date:   { val: test_date ? new Date(test_date) : new Date(), type: oracledb.DATE },
      result:      { val: testResult,          type: oracledb.STRING },
      tested_by:   { val: tested_by || null,   type: oracledb.STRING },
      new_id:      { dir: oracledb.BIND_OUT,   type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ test_id: newResult.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { donation_id, test_type, test_date, result: testResult, tested_by } = req.body;
  const updResult = await conn.execute(
    `UPDATE medical_test SET
       donation_id = :donation_id,
       test_type   = :test_type,
       test_date   = :test_date,
       result      = :result,
       tested_by   = :tested_by
     WHERE test_id = :id`,
    {
      donation_id: { val: Number(donation_id), type: oracledb.NUMBER },
      test_type:   { val: test_type,           type: oracledb.STRING },
      test_date:   { val: test_date ? new Date(test_date) : new Date(), type: oracledb.DATE },
      result:      { val: testResult,          type: oracledb.STRING },
      tested_by:   { val: tested_by || null,   type: oracledb.STRING },
      id:          { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (updResult.rowsAffected === 0) return res.status(404).json({ error: 'Test not found' });
  res.json({ test_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM medical_test WHERE test_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Test not found' });
  res.json({ test_id: Number(req.params.id) });
}));

module.exports = router;
