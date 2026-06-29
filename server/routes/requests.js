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
    console.error('requests route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT br.request_id, br.hospital_id, br.blood_type_id, br.patient_id,
            br.units, br.urgency,
            TO_CHAR(br.request_date, 'DD-Mon-YYYY') AS request_date,
            br.status,
            h.hospital_name, bt.blood_group,
            p.first_name || ' ' || p.last_name AS patient_name
       FROM blood_request br
       JOIN hospital   h  ON br.hospital_id   = h.hospital_id
       JOIN blood_type bt ON br.blood_type_id  = bt.blood_type_id
       JOIN patient    p  ON br.patient_id     = p.patient_id
      ORDER BY br.request_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const [hospitals, bloodTypes, patients] = await Promise.all([
    conn.execute(`SELECT hospital_id, hospital_name FROM hospital ORDER BY hospital_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    conn.execute(`SELECT blood_type_id, blood_group FROM blood_type ORDER BY blood_group`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    conn.execute(
      `SELECT patient_id, first_name || ' ' || last_name AS full_name FROM patient ORDER BY full_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
  ]);
  res.json({ hospitals: hospitals.rows, blood_types: bloodTypes.rows, patients: patients.rows });
}));

router.get('/banks', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT bank_id, bank_name FROM blood_bank ORDER BY bank_name`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { hospital_id, blood_type_id, patient_id, units, urgency } = req.body;
  await conn.execute(
    `INSERT INTO blood_request
       (request_id, hospital_id, blood_type_id, patient_id, units, urgency, request_date, status)
     VALUES
       (seq_blood_request.NEXTVAL, :hospital_id, :blood_type_id, :patient_id, :units, :urgency, SYSDATE, 'PENDING')`,
    {
      hospital_id:   { val: Number(hospital_id),   type: oracledb.NUMBER },
      blood_type_id: { val: Number(blood_type_id), type: oracledb.NUMBER },
      patient_id:    { val: Number(patient_id),    type: oracledb.NUMBER },
      units:         { val: Number(units),         type: oracledb.NUMBER },
      urgency:       { val: urgency,               type: oracledb.STRING },
    },
    { autoCommit: true }
  );
  res.status(201).json({ message: 'Blood request created successfully' });
}));

router.put('/:id/process', (req, res) => run(res, async (conn) => {
  const requestId = Number(req.params.id);
  const bankId    = Number(req.body.bank_id);

  // 1. Load the request — must exist and be PENDING
  const reqRes = await conn.execute(
    `SELECT patient_id, blood_type_id, units, status
       FROM blood_request WHERE request_id = :id`,
    { id: { val: requestId, type: oracledb.NUMBER } },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (reqRes.rows.length === 0)
    return res.status(404).json({ error: 'Blood request not found.' });
  const { PATIENT_ID: patientId, BLOOD_TYPE_ID: bloodTypeId, UNITS: units } = reqRes.rows[0];

  // 2. Find a non-expired inventory row for this bank + blood type
  const invRes = await conn.execute(
    `SELECT inventory_id, units AS available
       FROM blood_inventory
      WHERE bank_id = :bank_id AND blood_type_id = :bt_id AND expiry_date > SYSDATE
      ORDER BY expiry_date ASC
      FETCH FIRST 1 ROWS ONLY`,
    {
      bank_id: { val: bankId,      type: oracledb.NUMBER },
      bt_id:   { val: bloodTypeId, type: oracledb.NUMBER },
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (invRes.rows.length === 0)
    return res.status(400).json({ error: 'Selected bank has no stock of this blood type.' });
  const { INVENTORY_ID: inventoryId, AVAILABLE: available } = invRes.rows[0];
  if (available < units)
    return res.status(400).json({ error: `Insufficient stock. Available: ${available} unit(s), needed: ${units}.` });

  // 3. Deduct inventory
  await conn.execute(
    `UPDATE blood_inventory SET units = units - :units WHERE inventory_id = :inv_id`,
    {
      units:   { val: units,       type: oracledb.NUMBER },
      inv_id:  { val: inventoryId, type: oracledb.NUMBER },
    },
    { autoCommit: false }
  );

  // 4. Mark request fulfilled
  await conn.execute(
    `UPDATE blood_request SET status = 'FULFILLED' WHERE request_id = :id`,
    { id: { val: requestId, type: oracledb.NUMBER } },
    { autoCommit: false }
  );

  // 5. Create transfusion record
  await conn.execute(
    `INSERT INTO transfusion
       (transfusion_id, bank_id, patient_id, request_id, transfusion_date, units, notes)
     VALUES (seq_transfusion.NEXTVAL, :bank_id, :patient_id, :req_id, SYSDATE, :units, 'Processed via system')`,
    {
      bank_id:    { val: bankId,     type: oracledb.NUMBER },
      patient_id: { val: patientId,  type: oracledb.NUMBER },
      req_id:     { val: requestId,  type: oracledb.NUMBER },
      units:      { val: units,      type: oracledb.NUMBER },
    },
    { autoCommit: false }
  );

  // 6. Commit all three changes atomically
  await conn.commit();
  res.json({ message: 'Request processed successfully.', request_id: requestId });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { hospital_id, blood_type_id, patient_id, units, urgency } = req.body;
  const result = await conn.execute(
    `UPDATE blood_request SET
       hospital_id   = :hospital_id,
       blood_type_id = :blood_type_id,
       patient_id    = :patient_id,
       units         = :units,
       urgency       = :urgency
     WHERE request_id = :id`,
    {
      hospital_id:   { val: Number(hospital_id),   type: oracledb.NUMBER },
      blood_type_id: { val: Number(blood_type_id), type: oracledb.NUMBER },
      patient_id:    { val: Number(patient_id),    type: oracledb.NUMBER },
      units:         { val: Number(units),         type: oracledb.NUMBER },
      urgency:       { val: urgency,               type: oracledb.STRING },
      id:            { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Request not found' });
  res.json({ request_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM blood_request WHERE request_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Request not found' });
  res.json({ request_id: Number(req.params.id) });
}));

module.exports = router;
