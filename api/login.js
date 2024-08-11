import express from 'express';
import { conn, mysql } from '../dbconnect';
import util from 'util';

const queryAsync = util.promisify(conn.query).bind(conn);
export const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const typeuser = 'user';
    const sql = 'SELECT * FROM users WHERE type = ?';
    const result = await queryAsync(sql, [typeuser]);

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

router.get('/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const sql = 'SELECT * FROM users WHERE userID = ?';
    const result = await queryAsync(sql, [userID]);

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

router.post('/login', async (req, res) => {
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
