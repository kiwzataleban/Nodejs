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
        // SQL search
        let sql = `
            SELECT * FROM lottory
            WHERE uid IS NULL
              AND number LIKE ?
              AND accepted IS NULL
        `;
        let formattedSearch = `${search.numlotto}`;
        const result = await query(mysql.format(sql, [`%${formattedSearch}%`]));

        res.status(200).json(result); // Changed to 200 for successful search
    } catch (err) {
        console.error("Search Error:", err); // Added more descriptive logging
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
