const express = require('express');
const { conn } = require('../dbconnect');
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// login
router.post('/', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const sql = 'SELECT * FROM users WHERE phone = ? AND password = ?';
    const result = await queryAsync(sql, [phone, password]);

    if (result.length > 0) {
      res.json(result);
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
