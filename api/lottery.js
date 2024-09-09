const express = require('express');
const { conn, mysql } = require('../dbconnect');
const util = require('util');
const router = express.Router();
const query = util.promisify(conn.query).bind(conn);

router.get("/", async (req, res) => {
    try {
        const sql = "SELECT * FROM lottory WHERE uid IS NULL AND accepted IS NULL";
        const result = await query(sql);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/seprize", async (req, res) => {
    try {
        const sql = "SELECT * FROM `lottory` WHERE `prize` IN ('1', '2', '3', '4', '5') ORDER BY `prize` ASC;";
        const result = await query(sql);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.put("/userbuylotto", async (req, res) => {
    let userbuylotto = req.body;
    const pricelotto = 50; // Price of the lottery ticket

    try {
        // Validate inputs
        if (typeof userbuylotto.uid !== 'number' || typeof userbuylotto.lottery_id !== 'number') {
            return res.status(400).send("Invalid input");
        }

        // Check the user's balance first
        let sqlCheckbalance = "SELECT balance FROM users WHERE uid = ?";
        const result = await query(sqlCheckbalance, [userbuylotto.uid]);

        if (result.length === 0) {
            return res.status(404).send("User not found");
        }

        let currentbalance = result[0].balance;
        if (currentbalance < pricelotto) {
            return res.status(400).send("Insufficient funds");
        }

        // Update the user's balance
        let moneyuser = currentbalance - pricelotto;
        let updatebalance = "UPDATE users SET balance = ? WHERE uid = ?";
        await query(updatebalance, [moneyuser, userbuylotto.uid]);

        // Update the lotto table
        let sqlUpdateLotto = "UPDATE lottory SET uid = ? WHERE lottery_id = ?";
        await query(sqlUpdateLotto, [userbuylotto.uid, userbuylotto.lottery_id]);

        res.status(200).send({
            message: "Purchase successful",
            newBalance: moneyuser
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/searchlotto", async (req, res) => {
    let search = req.body;
    try {
        if (!search.number_lotto) {
            return res.status(400).send("Missing required field: number_lotto");
        }

        // Manually format the query
        let sql = `
            SELECT lottery_id, price, number, prize, uid, accepted
            FROM lottory
            WHERE number LIKE '%${search.number_lotto}%'
              AND accepted IS NULL
        `;
        console.log("Executing SQL Query:", sql); // Log the SQL query for debugging
        const result = await query(sql);

        if (result.length === 0) {
            return res.status(404).send("No matching lotto found");
        }

        res.status(200).json(result); // Send the matching results
    } catch (err) {
        console.error("Search Error:", err.message); // Log error details
        res.status(500).send("Internal Server Error");
    }
});

router.get("/lottouser/:uid", (req, res) => {
    let uid = req.params.uid;
    const sql = "SELECT * FROM lottory WHERE uid = ? AND (accepted IS NULL OR accepted = 0)";
    conn.query(sql, [uid], (err, result, fields) => {
        if (result && result.length > 0) {
            res.status(201).json(result);
        } else {
            res.status(500).json({
                success: false,
            });
        }
    });
});

module.exports = router;
