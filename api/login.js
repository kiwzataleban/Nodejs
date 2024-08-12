const express = require('express');
const { conn } = require('../dbconnect'); // ใช้ require แทน import
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// ล็อกอิน
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const result = await queryAsync(sql, [username, password]);

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
