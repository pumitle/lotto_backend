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

router.post("/login",(req,res)=>{
    const {email , password} = req.body;

    if(!email || !password){
        return res.status(400).json({error : "email and password are required"});
    }

    const sql = "SELECT * FROM User WHERE email = ? AND password = ?  ";
    conn.query(sql,[email,password],(err,result)=> {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (result.length > 0) {
            const user = result[0];
            const userRes = {
                Uid : user.Uid,
                name: user.name,
                email: user.email,
                password:user.password,
                phone:user.phone,
                image:user.image,
                type:user.type,
                wallet: user.wallet
            };

            const token = jwt.sign(userRes, 'your-secret-key', { expiresIn: '1h' });
            return res.json({ message: "Login successful", user: userRes, token });
            return res.json({ token });
          }else{
            return res.status(401).json({ error: "Invalid email or password" });
          }
    });


});

router.post("/register",(req,res)=>{
    const {name ,email ,phone, password,wallet} = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const query = 'INSERT INTO User (name,email,phone,password,type,wallet) VALUES (?,?,?,?,?,?)';
    conn.query(query,[name,email,phone,password,'User',wallet],(err,result)=>{
        if (err) {
            console.error('Error during registration:', err);
            return res.status(500).json({ err: 'Error during registration' });
        }

        return  res.status(201).json({ success: true, user: result, message: "Register successful" });
    });
});


// ส่งออก router
module.exports = { router };