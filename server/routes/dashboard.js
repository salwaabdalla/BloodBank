const express = require('express');
const router = express.Router();
const { getConnection } = require('../db');

router.get('/stats', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    const sql = `
      SELECT
        (SELECT COUNT(*) FROM donor)                                        AS total_donors,
        (SELECT COUNT(*) FROM donation)                                     AS total_donations,
        (SELECT COUNT(*) FROM blood_request WHERE UPPER(status) = 'PENDING') AS pending_requests,
        (SELECT NVL(SUM(units), 0) FROM blood_inventory
          WHERE expiry_date > SYSDATE)                                      AS total_inventory,
        (SELECT COUNT(*) FROM patient)                                      AS total_patients,
        (SELECT COUNT(*) FROM camp)                                         AS total_camps
      FROM dual
    `;

    const result = await conn.execute(sql, [], { outFormat: require('oracledb').OUT_FORMAT_OBJECT });
    const row = result.rows[0];

    res.json({
      total_donors:      row.TOTAL_DONORS,
      total_donations:   row.TOTAL_DONATIONS,
      pending_requests:  row.PENDING_REQUESTS,
      total_inventory:   row.TOTAL_INVENTORY,
      total_patients:    row.TOTAL_PATIENTS,
      total_camps:       row.TOTAL_CAMPS,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
