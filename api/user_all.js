const express = require('express');
const { conn,queryAsync } = require('../dbcon');
const mysql = require('mysql');
const jwt = require('jsonwebtoken'); 

const router = express.Router();

router.get("/",(req,res)=>{

    const sql = "select * from User";
    conn.query(sql,(err,result)=>{
        if(err){
            res.json(err);
        }else{
            res.json(result);
        }
    });

});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const sql = "SELECT * FROM User WHERE email = ? AND password = ?";
    conn.query(sql, [email, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length > 0) {
            const user = result[0];
            const userRes = {
                Uid: user.Uid,
                name: user.name,
                email: user.email,
                password: user.password,
                phone: user.phone,
                image: user.image,
                type: user.type,
                wallet: user.wallet
            };

            return res.json({ message: "Login successful", user: userRes });
        } else {
            return res.status(401).json({ error: "Invalid email or password" });
        }
    });
});


// router.post("/register",(req,res)=>{
//     const {name ,email ,phone, password,wallet} = req.body;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    
//     if (!emailRegex.test(email)) {
//         return res.status(400).json({ error: 'Invalid email format' });
//     }

//     const query = 'INSERT INTO User (name,email,phone,password,type,wallet) VALUES (?,?,?,?,?,?)';
//     conn.query(query,[name,email,phone,password,'User',wallet],(err,result)=>{
//         if (err) {
//             console.error('Error during registration:', err);
//             return res.status(500).json({ err: 'Error during registration' });
//         }

//         return  res.status(201).json({ success: true, user: result, message: "Register successful" });
//     });
// });

router.post("/register", (req, res) => {
    const { name, email, phone, password, wallet } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // ตรวจสอบว่าอีเมลหรือเบอร์โทรศัพท์มีอยู่แล้วในฐานข้อมูลหรือไม่
    const checkQuery = 'SELECT * FROM User WHERE email = ? OR phone = ?';
    conn.query(checkQuery, [email, phone], (err, results) => {
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).json({ error: 'Error checking existing user' });
        }

        // ถ้าเจอผู้ใช้ที่มีอีเมลหรือเบอร์โทรซ้ำกัน
        if (results.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email or phone' });
        }

        // ถ้าไม่มีผู้ใช้ซ้ำ ทำการสมัครสมาชิก
        const query = 'INSERT INTO User (name, email, phone, password, type, wallet) VALUES (?, ?, ?, ?, ?, ?)';
        conn.query(query, [name, email, phone, password, 'User', wallet], (err, result) => {
            if (err) {
                console.error('Error during registration:', err);
                return res.status(500).json({ error: 'Error during registration' });
            }

            return res.status(201).json({ success: true, user: result, message: 'Register successful' });
        });
    });
});


router.get("/getuserbyid",(req,res) => {
    const uid = req.query.uid;

    if (!uid) {
        return res.status(400).json({ error: "UID is required" });
      }
    const sql = 'SELECT * FROM User WHERE Uid = ?';
    conn.query(sql,[uid],(err,result) =>{
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: "Database query failed" });
          }
          if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
          }

          if (result.length > 0) {
            const user = result[0];
            const userRes = {
                Uid: user.Uid,
                name: user.name,
                email: user.email,
                password: user.password,
                phone: user.phone,
                image: user.image,
                type: user.type,
                wallet: user.wallet
            };

            return res.json({user: userRes});
        }
    });

});

//การเติมเงิน 
router.put("/addmoney", (req, res) => {
    const { uid, amount } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    if (!uid || amount == null) {
        return res.status(400).json({ error: "UID and amount are required" });
    }

    // ตรวจสอบว่าจำนวนเงินเป็นจำนวนที่ถูกต้อง
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }

    // คำสั่ง SQL เพื่อตรวจสอบยอดเงินปัจจุบัน
    const getBalanceQuery = 'SELECT wallet FROM User WHERE Uid = ?';
    conn.query(getBalanceQuery, [uid], (err, result) => {
        if (err) {
            console.error('Error fetching current balance:', err);
            return res.status(500).json({ error: "Error fetching current balance" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentBalance = parseFloat(result[0].wallet);
        const newBalance = currentBalance + parseFloat(amount);

        // คำสั่ง SQL เพื่อตั้งยอดเงินใหม่
        const updateBalanceQuery = 'UPDATE User SET wallet = ? WHERE Uid = ?';
        conn.query(updateBalanceQuery, [newBalance, uid], (err) => {
            if (err) {
                console.error('Error updating balance:', err);
                return res.status(500).json({ error: "Error updating balance" });
            }

            res.json({ message: "Balance updated successfully", newBalance });
        });
    });
});

//แก้ไขข้อมูลสมาชิก
router.put("/eiditprof" , async (req,res) => {
    const { name, email, password, phone, image } = req.body;

    if (!name || !email || !password || !phone || !image) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try{

        const {uid} = req.body;

        const updateQuery = `UPDATE User SET name = ? , email = ? ,password = ? ,phone = ? , image = ? WHERE Uid = ?`;

        const result = await conn.query(updateQuery, [name,email,password,phone,image,uid]);

        if (result.affectedRows > 0) {
            res.status(404).json({ message: "User not found." });
            
        }else {
          
            res.status(200).json({ message: "User information updated successfully." });
        }

    } catch(e) {
        console.error("Error updating user information:", e);
        res.status(500).json({ message: "An error occurred while updating user information." });
    }

});

// ส่งออก router
module.exports = { router };