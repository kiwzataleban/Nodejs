const express = require('express');
const { conn } = require('../dbconnect');
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// login
router.post('/', async (req, res) => {
  try {
    const { identifier, password } = req.body; 

    const sql = 'SELECT * FROM users WHERE (phone = ? OR email = ?) AND password = ?';
    const result = await queryAsync(sql, [identifier, identifier, password]);

    // If the user exists
    if (result.length > 0) {
      res.json({ success: true, user: result[0] });
    } else {
      res.json({ success: false, message: 'Invalid phone/email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
