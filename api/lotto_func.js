const express = require('express');
const { conn,queryAsync } = require('../dbcon');
const mysql = require('mysql');
const jwt = require('jsonwebtoken'); 

const router = express.Router();


// router.post("/random",(req,res)=>{

//     const sql = "select * from Lotto";
//     conn.query(sql,(err,result)=>{
//         if(err){
//             res.json(err);
//         }else{
//             res.json(result);
//         }
//     });

// });


///สุ่มเลข 100 ชุด
router.post("/random", (req, res) => {
    const sqlSelect = "SELECT COUNT(*) AS count FROM Lotto";
    
    conn.query(sqlSelect, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        }

        // ตรวจสอบว่ามีข้อมูลในตาราง Lotto แล้วหรือไม่
        if (result[0].count >= 100) {
            return res.status(400).json({ message: "Already have 100 records in the database" });
        }

        const randomNumbers = new Set();

        while (randomNumbers.size < 100) {
            const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
            randomNumbers.add(randomNumber);
        }

        const sqlInsert = "INSERT INTO Lotto (number_lot, price) VALUES ?";
        const values = Array.from(randomNumbers).map(num => [num,'80']);

        conn.query(sqlInsert, [values], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to insert data" });
            }

            return  res.json({ message: "Successfully inserted 100 random numbers", result });
        });
    });
});


///ลบข้อมูลแล้ว สุ่มใหม่
router.post("/resetrandom", (req, res) => {
    // ลบข้อมูลทั้งหมดในตาราง Lotto ก่อน
    const sqlDelete = "DELETE FROM Lotto";
    
    conn.query(sqlDelete, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete existing records" });
        }

        const randomNumbers = new Set();

        while (randomNumbers.size < 100) {
            const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
            randomNumbers.add(randomNumber);
        }

        const sqlInsert = "INSERT INTO Lotto (number_lot, price) VALUES ?";
        const values = Array.from(randomNumbers).map(num => [num, '80']); // ใส่ราคาคงที่เป็น 80

        conn.query(sqlInsert, [values], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to insert data" });
            }

            res.json({ message: "Successfully reset and inserted 100 random numbers", result });
        });
    });
});

//ออกรางวัล 1-5 
router.post("/getreward",(req, res) =>{

    const { prizeRank } = req.body;

    if (!prizeRank) {
        return res.status(400).json({ error: "Prize rank is required" });
    }

       // SQL query เพื่อเลือกเลขจากตาราง Lotto โดยเลือกเฉพาะที่ยังไม่มีสถานะ (เช่น สถานะเป็น NULL หรือเป็นค่าเริ่มต้น)
     const numSelect = "SELECT lot_id, number_lot FROM Lotto  WHERE status IS NULL ORDER BY RAND() LIMIT 1";

     conn.query(numSelect, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        }

        // ตรวจสอบว่ามีข้อมูลที่ได้จากการ query หรือไม่
        if (result.length === 0) {
            return res.status(404).json({ message: "No records found in the database" });
        }

        // เลขที่ถูกสุ่มขึ้นมา
        const winningNumber = result[0].number_lot;
        const winningId = result[0].lot_id;

        // SQL query เพื่ออัปเดตสถานะของชุดเลขที่ถูกสุ่ม
        const sqlUpdate = "UPDATE Lotto SET status = ? WHERE lot_id = ?";

        conn.query(sqlUpdate, [prizeRank, winningId], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update the status" });
            }

            res.json({ message: "Winning number selected and status updated", winningNumber: winningNumber, prizeRank: prizeRank });
        });
    });

});


router.get("/showreward",(req, res) =>{

    const  sql = "SELECT * FROM Lotto";
    conn.query(sql,(err,result)=>{
        if(err){
            res.json(err);
        }else{
            res.json(result);
        }
    });

});


// ส่งออก router
module.exports = { router };