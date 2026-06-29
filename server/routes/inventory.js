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
    console.error('inventory route error:', err);
    res.status(500).json({ error: err.message || 'Operation failed' });
  } finally {
    if (conn) await conn.close();
  }
};

router.get('/', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT bi.inventory_id, bi.bank_id, bi.blood_type_id,
            bi.units,
            TO_CHAR(bi.collection_date, 'YYYY-MM-DD') AS collection_date,
            TO_CHAR(bi.expiry_date,     'YYYY-MM-DD') AS expiry_date,
            bb.bank_name, bt.blood_group
       FROM blood_inventory bi
       JOIN blood_bank bb ON bi.bank_id       = bb.bank_id
       JOIN blood_type bt ON bi.blood_type_id = bt.blood_type_id
      ORDER BY bi.expiry_date ASC`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/summary', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `SELECT bb.bank_name, bt.blood_group, NVL(SUM(bi.units), 0) AS total_units
       FROM blood_inventory bi
       JOIN blood_bank bb ON bi.bank_id       = bb.bank_id
       JOIN blood_type bt ON bi.blood_type_id = bt.blood_type_id
      WHERE bi.expiry_date > SYSDATE
      GROUP BY bb.bank_name, bt.blood_group
      ORDER BY bb.bank_name, bt.blood_group`,
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  res.json(result.rows);
}));

router.get('/form-data', (req, res) => run(res, async (conn) => {
  const [banks, bloodTypes] = await Promise.all([
    conn.execute(`SELECT bank_id, bank_name FROM blood_bank ORDER BY bank_name`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    conn.execute(`SELECT blood_type_id, blood_group FROM blood_type ORDER BY blood_group`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
  ]);
  res.json({ banks: banks.rows, blood_types: bloodTypes.rows });
}));

router.post('/', (req, res) => run(res, async (conn) => {
  const { bank_id, blood_type_id, units, collection_date, expiry_date } = req.body;
  const result = await conn.execute(
    `INSERT INTO blood_inventory (inventory_id, bank_id, blood_type_id, units, collection_date, expiry_date)
     VALUES (seq_inventory.NEXTVAL, :bank_id, :blood_type_id, :units, :collection_date, :expiry_date)
     RETURNING inventory_id INTO :new_id`,
    {
      bank_id:         { val: Number(bank_id),       type: oracledb.NUMBER },
      blood_type_id:   { val: Number(blood_type_id), type: oracledb.NUMBER },
      units:           { val: Number(units),         type: oracledb.NUMBER },
      collection_date: { val: collection_date ? new Date(collection_date) : new Date(), type: oracledb.DATE },
      expiry_date:     { val: new Date(expiry_date), type: oracledb.DATE },
      new_id:          { dir: oracledb.BIND_OUT,     type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  res.status(201).json({ inventory_id: result.outBinds.new_id[0] });
}));

router.put('/:id', (req, res) => run(res, async (conn) => {
  const { bank_id, blood_type_id, units, collection_date, expiry_date } = req.body;
  const result = await conn.execute(
    `UPDATE blood_inventory SET
       bank_id         = :bank_id,
       blood_type_id   = :blood_type_id,
       units           = :units,
       collection_date = :collection_date,
       expiry_date     = :expiry_date
     WHERE inventory_id = :id`,
    {
      bank_id:         { val: Number(bank_id),       type: oracledb.NUMBER },
      blood_type_id:   { val: Number(blood_type_id), type: oracledb.NUMBER },
      units:           { val: Number(units),         type: oracledb.NUMBER },
      collection_date: { val: collection_date ? new Date(collection_date) : new Date(), type: oracledb.DATE },
      expiry_date:     { val: new Date(expiry_date), type: oracledb.DATE },
      id:              { val: Number(req.params.id), type: oracledb.NUMBER },
    },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Inventory record not found' });
  res.json({ inventory_id: Number(req.params.id) });
}));

router.delete('/:id', (req, res) => run(res, async (conn) => {
  const result = await conn.execute(
    `DELETE FROM blood_inventory WHERE inventory_id = :id`,
    { id: { val: Number(req.params.id), type: oracledb.NUMBER } },
    { autoCommit: true }
  );
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Inventory record not found' });
  res.json({ inventory_id: Number(req.params.id) });
}));

module.exports = router;
