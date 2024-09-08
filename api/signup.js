const express = require('express');
const { conn } = require('../dbconnect');
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// Sign up
router.post('/', async (req, res) => {
  try {
    const { username, password, email, phone, balance } = req.body;

    // Validate that the balance is a valid number
    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ success: false, message: 'Invalid balance value' });
    }

    const checkSql = 'SELECT * FROM users WHERE phone = ?';
    const existingUser = await queryAsync(checkSql, [phone]);

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Set the user type as 'user'
    const userType = 'user';

    const insertSql = 'INSERT INTO users (username, password, email, phone, type, balance) VALUES (?, ?, ?, ?, ?, ?)';
    await queryAsync(insertSql, [username, password, email, phone, userType, balance]);

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
