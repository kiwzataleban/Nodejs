const express = require('express');
const router = express.Router();
const { queryAsync } = require('../dbconnect');

// ดึงข้อมูลผู้ใช้ทั้งหมดของUser
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


// ดึงข้อมูลผู้ใช้ตาม ID
router.get("/:userID", async (req, res) => {
    try {
        let userID = req.params.userID;
        const sql = "SELECT * FROM users WHERE uid = ?";
        const result = await queryAsync(sql, [userID]);
        if (result.length > 0) {
            res.json(result);
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ success: false, message: 'Database query error' });
    }
});
router.put("/:userID", async (req, res) => {
  let userID = req.params.userID;
  let { fullname, phone, email } = req.body; // Assuming fullname is the correct field name

  // SQL query to update user data
  const sql = `
      UPDATE users
      SET username = ?, phone = ?, email = ?
      WHERE uid = ?
  `;

  try {
      // Execute the SQL query
      const result = await queryAsync(sql, [fullname, phone, email, userID]);

      if (result.affectedRows > 0) {
          res.json({ success: true, message: 'User updated successfully' });
      } else {
          res.json({ success: false, message: 'User not found' });
      }
  } catch (err) {
      console.error('Database query error:', err.message); // Log the specific error message
      res.status(500).json({ success: false, message: `Database query error: ${err.message}` });
  }
});

module.exports = router;
