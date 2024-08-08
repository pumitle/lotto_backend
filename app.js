// // นำเข้า Express
// const express = require('express');
// const app = express();

// // การตั้งค่า middleware เพื่อรองรับการรับข้อมูล JSON
// app.use(express.json());

// // กำหนด route สำหรับ endpoint หลัก
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// // คุณสามารถเพิ่ม routes อื่นๆ ได้ที่นี่
// app.get('/api/example', (req, res) => {
//   res.json({ message: 'This is an example API endpoint!' });
// });

// // ตั้งค่าพอร์ตและเริ่มต้นเซิร์ฟเวอร์
// module.exports = { app };


// นำเข้าโมดูลที่ต้องการ
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// นำเข้าส่วนที่ต้องการจาก API ต่างๆ
const { router: test } = require('./api/test');

// สร้าง instance ของ Express
const app = express();

// ตั้งค่า CORS
app.use(
    cors({
      origin: "*",
    })
);

// ตั้งค่า body-parser
app.use(bodyParser.text());
app.use(bodyParser.json());

// ตั้งค่า routes
app.use("/testapp", test);
// ส่งออก app
module.exports = { app };
