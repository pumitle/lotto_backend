// นำเข้าโมดูลที่ต้องการ
const express = require('express');
const router = express.Router();

// กำหนด route ที่จะใช้ใน API
router.get('/', (req, res) => {
  res.send('Hello World');
});

router.get('/example', (req, res) => {
  res.json({ message: 'This is an example route!' });
});

router.post('/submit', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

// ส่งออก router
module.exports = { router };
