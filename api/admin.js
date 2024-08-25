const express = require('express');
const router = express.Router();

// Define your admin routes here
router.get('/', (req, res) => {
  res.send('Admin route');
});

module.exports = router;
