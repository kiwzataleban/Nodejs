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

router.get("/seprize", (req, res) => {
    const sql = "SELECT * FROM `lottory` WHERE `prize` IN ('1', '2', '3', '4', '5') ORDER BY `prize` ASC;";
    conn.query(sql, (err, result, fields) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        res.status(201).json(result);
    });
});

router.put("/userbuylotto", async (req, res) => {
    let userbuylotto = req.body;
    const pricelotto = 100; // Price of the lottery ticket

    // Check the user's balance balance first
    let sqlCheckbalance = "SELECT balance FROM users WHERE uid = ?";
    conn.query(sqlCheckbalance, [userbuylotto.uid], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        if (result.length === 0) {
            return res.status(404).send("User not found");
        }

        let currentbalance = result[0].balance;
        if (currentbalance < pricelotto) {
            return res.status(400).send("Insufficient funds");
        }

        // Update the user's balance after checking the balance
        let moneyuser = currentbalance - pricelotto;
        let updatebalance = "UPDATE users SET balance = ? WHERE uid = ?";
        let sqlUpdatebalance = mysql.format(updatebalance, [moneyuser, userbuylotto.uid]);
        conn.query(sqlUpdatebalance, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal Server Error");
            }

            // Proceed to update the lotto table
            let sqlUpdateLotto = "UPDATE lottory SET uid = ? WHERE lottery_id = ?";
            let sqlFormattedLotto = mysql.format(sqlUpdateLotto, [userbuylotto.uid, userbuylotto.lottery_id]);
            conn.query(sqlFormattedLotto, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Internal Server Error");
                }
                res.status(200).send("Purchase successful");
            });
        });
    });
});

module.exports = router;
