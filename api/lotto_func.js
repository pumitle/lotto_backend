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
router.post("/getreward", (req, res) => {
    const { prizeRank } = req.body;

    if (!prizeRank) {
        return res.status(400).json({ error: "Prize rank is required" });
    }

    // SQL query เพื่อตรวจสอบว่ามีรางวัลที่เลือกแล้วหรือไม่
    const checkExistingStatus = "SELECT COUNT(*) AS count FROM Lotto WHERE status = ?";
    
    conn.query(checkExistingStatus, [prizeRank], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        }

        // ตรวจสอบว่ามีรางวัลที่เลือกแล้วหรือไม่
        if (result[0].count > 0) {
            return res.status(400).json({ error: "Prize rank already assigned" });
        }

        // SQL query เพื่อเลือกเลขจากตาราง Lotto โดยเลือกเฉพาะที่ยังไม่มีสถานะ (เช่น สถานะเป็น NULL หรือเป็นค่าเริ่มต้น)
        const numSelect = "SELECT lot_id, number_lot FROM Lotto WHERE status IS NULL ORDER BY RAND() LIMIT 1";

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

//แรนด้อมโชวล็อตเตอรี่ แค่ 10 ชุด 
router.get("/lottoranshow", (req, res) => {
    // SQL query to select 10 random lotto records
    const sql = "SELECT * FROM Lotto ORDER BY RAND() LIMIT 10";

    conn.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error", details: err });
        }

        // Send the results as JSON response
        res.json(result);
    });
});


//แสดงแค่ตัวเลข
router.get("/getNumbers",(req, res) =>{

    const  sql = "SELECT number_lot FROM Lotto  ";

    conn.query(sql,(err,result)=>{
        if(err){
            res.json(err);
        }else{
            res.json(result);
        }
    });

});

// Node.js Express Example
router.get("/checkdata", (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM Lotto";
    conn.query(sql, (err, result) => {
        if (err) {
            return res.json(err);
        }
        const hasData = result[0].count > 0;
        res.json({ hasData });
    });
});


// รีเซตระบบ 
router.delete("/resetsys", (req, res) => {
    // SQL Query สำหรับการปิดการตรวจสอบ `FOREIGN KEY` ชั่วคราว
    const disableForeignKeyChecks = "SET FOREIGN_KEY_CHECKS = 0";

    // SQL Query สำหรับการลบข้อมูลทั้งหมดจากตาราง Lotto
    const deleteLottoData = "DELETE FROM Lotto";

    // SQL Query สำหรับการลบข้อมูลในตาราง User ยกเว้นสมาชิกที่มี type เป็น Admin
    const deleteUserData = "DELETE FROM User WHERE type != 'Admin'";

    // SQL Query สำหรับการเปิดการตรวจสอบ `FOREIGN KEY` กลับคืน
    const enableForeignKeyChecks = "SET FOREIGN_KEY_CHECKS = 1";

    // เริ่มต้นการลบข้อมูล
    conn.query(disableForeignKeyChecks, (err) => {
        if (err) {
            return res.json({ error: 'Failed to disable foreign key checks', details: err });
        }

        // ลบข้อมูลในตาราง Lotto
        conn.query(deleteLottoData, (err, result) => {
            if (err) {
                return res.json({ error: 'Failed to delete Lotto data', details: err });
            }

            // ลบข้อมูลในตาราง User ยกเว้น Admin
            conn.query(deleteUserData, (err, result) => {
                if (err) {
                    return res.json({ error: 'Failed to delete User data', details: err });
                }

                // เปิดการตรวจสอบ `FOREIGN KEY` กลับคืน
                conn.query(enableForeignKeyChecks, (err) => {
                    if (err) {
                        return res.json({ error: 'Failed to enable foreign key checks', details: err });
                    }

                    // ส่งผลลัพธ์เมื่อสำเร็จ
                    res.json({ success: true, result });
                });
            });
        });
    });
});



router.get("/getrewardbystatus", (req, res) => {
    // กำหนดค่า status ที่ต้องการ
    const statusValues = [1, 2, 3, 4, 5];
    
    // สร้างเงื่อนไข SQL ด้วย IN clause
    const sql = "SELECT * FROM Lotto WHERE status IN (?)";
    
    // ใช้ query parameter เพื่อป้องกัน SQL injection
    conn.query(sql, [statusValues], (err, result) => {
        if (err) {
            // ส่งกลับข้อผิดพลาดในกรณีที่มีข้อผิดพลาดเกิดขึ้น
            res.status(500).json({ error: err.message });
        } else {
            // ส่งกลับผลลัพธ์
            res.json(result);
        }
    });
});


//////////////////////
// User function

//ซื้อรางวัล 
router.put("/buylot", (req, res) => {
    const { uid, lotId } = req.body; // รับค่า uid และ lotId จาก body

    // ตรวจสอบเงินในกระเป๋าผู้ใช้
    const checkWalletSql = "SELECT wallet FROM User WHERE Uid = ?";
    conn.query(checkWalletSql, [uid], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error", details: err });
        }

        if (result.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const userWallet = parseFloat(result[0].wallet);

        if (userWallet < 80) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // ดำเนินการซื้อรางวัลและอัพเดตกระเป๋าเงิน
        const purchaseSql = "UPDATE Lotto SET uid_fk = ? WHERE lot_id = ? AND uid_fk IS NULL";
        conn.query(purchaseSql, [uid, lotId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Internal Server Error", details: err });
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({ error: "Lotto not available or already purchased" });
            }

            const newWalletBalance = userWallet - 80;
            const updateWalletSql = "UPDATE User SET wallet = ? WHERE Uid = ?";
            conn.query(updateWalletSql, [newWalletBalance, uid], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to update wallet", details: err });
                }

                res.json({ success: true, message: "Lotto purchased successfully", newWalletBalance });
            });
        });
    });
});


// ค้นหาเลขรางวัล
router.get("/search", (req, res) => {
    const { digit1, digit2, digit3, digit4, digit5, digit6 } = req.query;

    // สร้างเงื่อนไขการค้นหาแต่ละตำแหน่งของตัวเลข
    const conditions = [];
    if (digit1) conditions.push(`SUBSTRING(number_lot, 1, 1) = ${conn.escape(digit1)}`);
    if (digit2) conditions.push(`SUBSTRING(number_lot, 2, 1) = ${conn.escape(digit2)}`);
    if (digit3) conditions.push(`SUBSTRING(number_lot, 3, 1) = ${conn.escape(digit3)}`);
    if (digit4) conditions.push(`SUBSTRING(number_lot, 4, 1) = ${conn.escape(digit4)}`);
    if (digit5) conditions.push(`SUBSTRING(number_lot, 5, 1) = ${conn.escape(digit5)}`);
    if (digit6) conditions.push(`SUBSTRING(number_lot, 6, 1) = ${conn.escape(digit6)}`);

    // รวมเงื่อนไขการค้นหา
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // สร้าง SQL Query สำหรับการค้นหา
    const sql = `SELECT * FROM Lotto ${whereClause}`;

    // ดำเนินการค้นหาในฐานข้อมูล
    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error", details: err });
        }

        // ส่งผลลัพธ์การค้นหากลับไป
        res.json(results);
    });
});




// ส่งออก router
module.exports = { router };