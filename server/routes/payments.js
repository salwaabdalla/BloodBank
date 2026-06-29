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
    console.error('payments route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT pay.payment_id, pay.request_id, pay.patient_id,
            pay.amount,
            TO_CHAR(pay.payment_date, 'YYYY-MM-DD') AS payment_date,
            pay.payment_method, pay.status,
            p.first_name || ' ' || p.last_name AS patient_name,
            br.units, br.urgency
       FROM payment       pay
       JOIN patient       p  ON pay.patient_id = p.patient_id
       JOIN blood_request br ON pay.request_id = br.request_id
      ORDER BY pay.payment_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT br.request_id, br.patient_id, br.units, br.urgency,
            bt.blood_group,
            p.first_name || ' ' || p.last_name AS patient_name,
            h.hospital_name
       FROM blood_request br
       JOIN patient    p  ON br.patient_id    = p.patient_id
       JOIN blood_type bt ON br.blood_type_id = bt.blood_type_id
       JOIN hospital   h  ON br.hospital_id   = h.hospital_id
      ORDER BY br.request_id DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json({ requests: result.rows });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { request_id, patient_id, amount, payment_date, payment_method, status } = req.body;
  const result = await conn.execute(
    `INSERT INTO payment (payment_id, request_id, patient_id, amount, payment_date, payment_method, status)
     VALUES (seq_payment.NEXTVAL, :request_id, :patient_id, :amount, :payment_date, :payment_method, :status)
     RETURNING payment_id INTO :new_id`,
    {
      request_id:     { val: Number(request_id),  type: oracledb.NUMBER },
      patient_id:     { val: Number(patient_id),  type: oracledb.NUMBER },
      amount:         { val: Number(amount) || 0, type: oracledb.NUMBER },
      payment_date:   { val: payment_date ? new Date(payment_date) : new Date(), type: oracledb.DATE },
      payment_method: { val: payment_method,      type: oracledb.STRING },
      status:         { val: status || 'PENDING', type: oracledb.STRING },
      new_id:         { dir: oracledb.BIND_OUT,   type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ payment_id: result.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { request_id, patient_id, amount, payment_date, payment_method, status } = req.body;
  const result = await conn.execute(
    `UPDATE payment SET
       request_id     = :request_id,
       patient_id     = :patient_id,
       amount         = :amount,
       payment_date   = :payment_date,
       payment_method = :payment_method,
       status         = :status
     WHERE payment_id = :id`,
    {
      request_id:     { val: Number(request_id),  type: oracledb.NUMBER },
      patient_id:     { val: Number(patient_id),  type: oracledb.NUMBER },
      amount:         { val: Number(amount) || 0, type: oracledb.NUMBER },
      payment_date:   { val: payment_date ? new Date(payment_date) : new Date(), type: oracledb.DATE },
      payment_method: { val: payment_method,      type: oracledb.STRING },
      status:         { val: status,              type: oracledb.STRING },
      id:             { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Payment not found' });
  res.json({ payment_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM payment WHERE payment_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Payment not found' });
  res.json({ payment_id: Number(req.params.id) });
}));

module.exports = router;
