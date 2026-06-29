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
    console.error('patients route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT p.patient_id, p.hospital_id, p.blood_type_id,
            p.first_name, p.last_name, p.gender,
            TO_CHAR(p.date_of_birth,  'YYYY-MM-DD') AS date_of_birth,
            TO_CHAR(p.admission_date, 'DD-Mon-YYYY') AS admission_date,
            p.phone, h.hospital_name, bt.blood_group
       FROM patient p
       JOIN hospital   h  ON p.hospital_id   = h.hospital_id
       JOIN blood_type bt ON p.blood_type_id  = bt.blood_type_id
      ORDER BY p.patient_id DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const [hospitals, bloodTypes] = await Promise.all([
    conn.execute(`SELECT hospital_id, hospital_name FROM hospital ORDER BY hospital_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    conn.execute(`SELECT blood_type_id, blood_group FROM blood_type ORDER BY blood_group`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
  ]);
  res.json({ hospitals: hospitals.rows, blood_types: bloodTypes.rows });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { hospital_id, blood_type_id, first_name, last_name, gender, date_of_birth, phone } = req.body;
  await conn.execute(
    `INSERT INTO patient
       (patient_id, hospital_id, blood_type_id, first_name, last_name, gender, date_of_birth, phone, admission_date)
     VALUES
       (seq_patient.NEXTVAL, :hospital_id, :blood_type_id, :first_name, :last_name, :gender, :date_of_birth, :phone, SYSDATE)`,
    {
      hospital_id:   { val: Number(hospital_id),    type: oracledb.NUMBER },
      blood_type_id: { val: Number(blood_type_id),  type: oracledb.NUMBER },
      first_name:    { val: first_name,              type: oracledb.STRING },
      last_name:     { val: last_name,               type: oracledb.STRING },
      gender:        { val: gender,                  type: oracledb.STRING },
      date_of_birth: { val: new Date(date_of_birth), type: oracledb.DATE   },
      phone:         { val: phone || null,            type: oracledb.STRING },
    },
    { autoCommit: true }
  );
  res.status(201).json({ message: 'Patient added successfully' });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { hospital_id, blood_type_id, first_name, last_name, gender, date_of_birth, phone } = req.body;
  const result = await conn.execute(
    `UPDATE patient SET
       hospital_id   = :hospital_id,
       blood_type_id = :blood_type_id,
       first_name    = :first_name,
       last_name     = :last_name,
       gender        = :gender,
       date_of_birth = :date_of_birth,
       phone         = :phone
     WHERE patient_id = :id`,
    {
      hospital_id:   { val: Number(hospital_id),    type: oracledb.NUMBER },
      blood_type_id: { val: Number(blood_type_id),  type: oracledb.NUMBER },
      first_name:    { val: first_name,              type: oracledb.STRING },
      last_name:     { val: last_name,               type: oracledb.STRING },
      gender:        { val: gender,                  type: oracledb.STRING },
      date_of_birth: { val: new Date(date_of_birth), type: oracledb.DATE   },
      phone:         { val: phone || null,            type: oracledb.STRING },
      id:            { val: Number(req.params.id),   type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Patient not found' });
  res.json({ patient_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM patient WHERE patient_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Patient not found' });
  res.json({ patient_id: Number(req.params.id) });
}));

module.exports = router;
