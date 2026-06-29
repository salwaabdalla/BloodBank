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
    console.error('donations route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT dn.donation_id,
            dn.donor_id, dn.blood_type_id, dn.bank_id, dn.camp_id,
            TO_CHAR(dn.donation_date, 'YYYY-MM-DD') AS donation_date,
            dn.units, dn.status,
            d.first_name  || ' ' || d.last_name AS donor_name,
            bt.blood_group, bb.bank_name, c.camp_name
       FROM donation dn
       JOIN donor      d  ON dn.donor_id      = d.donor_id
       JOIN blood_type bt ON dn.blood_type_id  = bt.blood_type_id
       JOIN blood_bank bb ON dn.bank_id        = bb.bank_id
       JOIN camp       c  ON dn.camp_id        = c.camp_id
      ORDER BY dn.donation_date DESC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const [donors, bloodTypes, banks, camps] = await Promise.all([
    conn.execute(
      `SELECT donor_id, first_name || ' ' || last_name AS full_name
         FROM donor WHERE is_eligible = 'Y' ORDER BY full_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
    conn.execute(
      `SELECT blood_type_id, blood_group FROM blood_type ORDER BY blood_group`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
    conn.execute(
      `SELECT bank_id, bank_name FROM blood_bank ORDER BY bank_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
    conn.execute(
      `SELECT camp_id, camp_name FROM camp ORDER BY camp_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
  ]);
  res.json({ donors: donors.rows, blood_types: bloodTypes.rows, banks: banks.rows, camps: camps.rows });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { p_donor_id, p_blood_type_id, p_bank_id, p_camp_id, p_units } = req.body;
  const result = await conn.execute(
    `BEGIN
       record_donation(:p_donor_id, :p_blood_type_id, :p_bank_id, :p_camp_id, :p_units,
                       :p_donation_id, :p_donor_eligible);
     END;`,
    {
      p_donor_id:       { val: Number(p_donor_id),      type: oracledb.NUMBER },
      p_blood_type_id:  { val: Number(p_blood_type_id), type: oracledb.NUMBER },
      p_bank_id:        { val: Number(p_bank_id),       type: oracledb.NUMBER },
      p_camp_id:        { val: Number(p_camp_id),       type: oracledb.NUMBER },
      p_units:          { val: Number(p_units),         type: oracledb.NUMBER },
      p_donation_id:    { dir: oracledb.BIND_OUT,       type: oracledb.NUMBER },
      p_donor_eligible: { dir: oracledb.BIND_INOUT,     type: oracledb.STRING, val: 'Y', maxSize: 1 },
    },
    { autoCommit: true }
  );
  if (result.outBinds.p_donor_eligible === 'N') {
    return res.status(400).json({ error: 'Donor is not eligible for donation' });
  }
  res.status(201).json({ donation_id: result.outBinds.p_donation_id });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { donor_id, blood_type_id, bank_id, camp_id, units, status, donation_date } = req.body;
  const result = await conn.execute(
    `UPDATE donation SET
       donor_id      = :donor_id,
       blood_type_id = :blood_type_id,
       bank_id       = :bank_id,
       camp_id       = :camp_id,
       units         = :units,
       status        = :status,
       donation_date = :donation_date
     WHERE donation_id = :id`,
    {
      donor_id:      { val: Number(donor_id),      type: oracledb.NUMBER },
      blood_type_id: { val: Number(blood_type_id), type: oracledb.NUMBER },
      bank_id:       { val: Number(bank_id),       type: oracledb.NUMBER },
      camp_id:       { val: Number(camp_id),       type: oracledb.NUMBER },
      units:         { val: Number(units),         type: oracledb.NUMBER },
      status:        { val: status,                type: oracledb.STRING },
      donation_date: { val: donation_date ? new Date(donation_date) : new Date(), type: oracledb.DATE },
      id:            { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Donation not found' });
  res.json({ donation_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM donation WHERE donation_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Donation not found' });
  res.json({ donation_id: Number(req.params.id) });
}));

module.exports = router;
