const express = require('express');
const { conn } = require('../dbconnect');
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// Sign up
router.post('/', async (req, res) => {
  try {
    const { username, password, email, phone, balance } = req.body;

    // Convert balance to a number if it's provided as a string
    const parsedBalance = balance !== undefined ? Number(balance) : undefined;

    // Validate that balance, if provided, is a valid number
    if (parsedBalance !== undefined && (isNaN(parsedBalance) || parsedBalance < 0)) {
      return res.status(400).json({ success: false, message: 'Invalid balance value' });
    }

    // Set the default balance if not provided
    const userBalance = parsedBalance !== undefined ? parsedBalance : 500;

    const checkSql = 'SELECT * FROM users WHERE phone = ?';
    const existingUser = await queryAsync(checkSql, [phone]);

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const userType = 'user';

    const insertSql = 'INSERT INTO users (username, password, email, phone, type, balance) VALUES (?, ?, ?, ?, ?, ?)';
    await queryAsync(insertSql, [username, password, email, phone, userType, userBalance]);

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
