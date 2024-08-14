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
                type:user.type
            };

            const token = jwt.sign(userRes, 'your-secret-key', { expiresIn: '1h' });
            return res.json({ message: "Login successful", user: userRes, token });
            return res.json({ token });
          }else{
            return res.status(401).json({ error: "Invalid email or password" });
          }
    });


});


// ส่งออก router
module.exports = { router };