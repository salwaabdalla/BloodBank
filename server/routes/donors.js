const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET /api/donors
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT d.donor_id,
              d.first_name,
              d.last_name,
              d.gender,
              TO_CHAR(d.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
              d.phone,
              d.email,
              d.is_eligible,
              bt.blood_group
         FROM donor d
         JOIN blood_type bt ON d.blood_type_id = bt.blood_type_id
        ORDER BY d.donor_id DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /donors error:', err);
    res.status(500).json({ error: 'Failed to fetch donors' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/donors/blood-types
router.get('/blood-types', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT blood_type_id, blood_group
         FROM blood_type
        ORDER BY blood_group`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /donors/blood-types error:', err);
    res.status(500).json({ error: 'Failed to fetch blood types' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/donors
router.post('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    // Reject if a donor with the same email already exists (case-insensitive).
    // This is the primary guard against duplicate registrations.
    if (req.body.email && req.body.email.trim() !== '') {
      const dupCheck = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM donor WHERE LOWER(email) = LOWER(:email)`,
        { email: { val: req.body.email.trim(), type: oracledb.STRING } },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (Number(dupCheck.rows[0].CNT) > 0) {
        return res.status(409).json({ error: 'A donor with this email address already exists.' });
      }
    }

    const result = await conn.execute(
      `BEGIN
         register_donor(
           :p_blood_type_id,
           :p_first_name,
           :p_last_name,
           :p_gender,
           :p_dob,
           :p_phone,
           :p_email,
           :p_donor_id
         );
       END;`,
      {
        p_blood_type_id: { val: Number(req.body.blood_type_id),        type: oracledb.NUMBER },
        p_first_name:    { val: req.body.first_name,                   type: oracledb.STRING },
        p_last_name:     { val: req.body.last_name,                    type: oracledb.STRING },
        p_gender:        { val: req.body.gender,                       type: oracledb.STRING },
        p_dob:           { val: new Date(req.body.date_of_birth),      type: oracledb.DATE   },
        p_phone:         { val: req.body.phone,                        type: oracledb.STRING },
        p_email:         { val: req.body.email,                        type: oracledb.STRING },
        p_donor_id:      { dir: oracledb.BIND_OUT,                     type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );
    res.status(201).json({ donor_id: result.outBinds.p_donor_id });
  } catch (err) {
    console.error('POST /donors error:', err);
    const msg = err.message || 'Failed to register donor';
    res.status(500).json({ error: msg });
  } finally {
    if (conn) await conn.close();
  }
});

// DELETE /api/donors/:id
router.delete('/:id', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `DELETE FROM donor WHERE donor_id = :donor_id`,
      { donor_id: { val: Number(req.params.id), type: oracledb.NUMBER } },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    res.json({ donor_id: Number(req.params.id) });
  } catch (err) {
    console.error('DELETE /donors/:id error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete donor' });
  } finally {
    if (conn) await conn.close();
  }
});

// PUT /api/donors/:id
router.put('/:id', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE donor SET
         blood_type_id = :blood_type_id,
         first_name    = :first_name,
         last_name     = :last_name,
         gender        = :gender,
         date_of_birth = :dob,
         phone         = :phone,
         email         = :email,
         is_eligible   = :is_eligible
       WHERE donor_id  = :donor_id`,
      {
        blood_type_id: { val: Number(req.body.blood_type_id),   type: oracledb.NUMBER },
        first_name:    { val: req.body.first_name,              type: oracledb.STRING },
        last_name:     { val: req.body.last_name,               type: oracledb.STRING },
        gender:        { val: req.body.gender,                  type: oracledb.STRING },
        dob:           { val: new Date(req.body.date_of_birth), type: oracledb.DATE   },
        phone:         { val: req.body.phone,                   type: oracledb.STRING },
        email:         { val: req.body.email,                   type: oracledb.STRING },
        is_eligible:   { val: req.body.is_eligible,             type: oracledb.STRING },
        donor_id:      { val: Number(req.params.id),            type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    res.json({ donor_id: Number(req.params.id) });
  } catch (err) {
    console.error('PUT /donors/:id error:', err);
    res.status(500).json({ error: err.message || 'Failed to update donor' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
