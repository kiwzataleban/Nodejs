const express = require('express');
const { conn } = require('../dbconnect');
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// Sign up
router.post('/', async (req, res) => {
  try {
    const { username, password, email, phone, img } = req.body;

    const checkSql = 'SELECT * FROM users WHERE username = ?';
    const existingUser = await queryAsync(checkSql, [username]);

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const insertSql = 'INSERT INTO users (username, password, email, phone, img) VALUES (?, ?, ?, ?, ?)';
    await queryAsync(insertSql, [username, password, email, phone, img]);

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;