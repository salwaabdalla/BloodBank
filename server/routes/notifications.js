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
    console.error('notifications route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT n.notification_id, n.donor_id, n.patient_id,
            n.message,
            TO_CHAR(n.sent_date, 'DD-Mon-YYYY') AS sent_date,
            n.notif_type, n.is_read,
            d.first_name || ' ' || d.last_name AS donor_name,
            p.first_name || ' ' || p.last_name AS patient_name
       FROM notification n
       LEFT JOIN donor   d ON n.donor_id   = d.donor_id
       LEFT JOIN patient p ON n.patient_id = p.patient_id
      ORDER BY n.sent_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const [donors, patients] = await Promise.all([
    conn.execute(
      `SELECT donor_id, first_name || ' ' || last_name AS full_name FROM donor ORDER BY full_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    conn.execute(
      `SELECT patient_id, first_name || ' ' || last_name AS full_name FROM patient ORDER BY full_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
  ]);
  res.json({ donors: donors.rows, patients: patients.rows });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { donor_id, patient_id, message, notif_type } = req.body;
  const result = await conn.execute(
    `INSERT INTO notification (notification_id, donor_id, patient_id, message, sent_date, notif_type, is_read)
     VALUES (seq_notification.NEXTVAL, :donor_id, :patient_id, :message, SYSDATE, :notif_type, 'N')
     RETURNING notification_id INTO :new_id`,
    {
      donor_id:   { val: donor_id   ? Number(donor_id)   : null, type: oracledb.NUMBER },
      patient_id: { val: patient_id ? Number(patient_id) : null, type: oracledb.NUMBER },
      message:    { val: message,    type: oracledb.STRING },
      notif_type: { val: notif_type, type: oracledb.STRING },
      new_id:     { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ notification_id: result.outBinds.new_id[0] });
}));

router.put('/:id/read', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `UPDATE notification SET is_read = 'Y' WHERE notification_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Notification not found' });
  res.json({ notification_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM notification WHERE notification_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Notification not found' });
  res.json({ notification_id: Number(req.params.id) });
}));

module.exports = router;
