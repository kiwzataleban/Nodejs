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
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.put("/userbuylotto", async (req, res) => {
    let userbuylotto = req.body;
    const pricelotto = 50; // Price of the lottery ticket

    try {
        // Check the user's wallet balance
        const sqlCheckWallet = "SELECT balance FROM users WHERE uid = ?";
        const walletResults = await query(sqlCheckWallet, [userbuylotto.uid]);

        if (walletResults.length === 0) {
            return res.status(404).send("User not found");
        }

        let currentWallet = walletResults[0].balance;
        if (currentWallet < pricelotto) {
            return res.status(400).send("Insufficient funds");
        }

        // Check if the ticket is already purchased by another user
        const sqlCheckTicket = "SELECT * FROM lottory WHERE lottery_id = ? AND uid IS NOT NULL";
        const ticketResults = await query(sqlCheckTicket, [userbuylotto.lottery_id]);

        if (ticketResults.length > 0) {
            return res.status(400).send("Ticket already purchased");
        }

        // Update the user's wallet
        let moneyuser = currentWallet - pricelotto;
        const updateWallet = "UPDATE users SET balance = ? WHERE uid = ?";
        const walletUpdateResult = await query(updateWallet, [moneyuser, userbuylotto.uid]);

        if (walletUpdateResult.affectedRows === 0) {
            return res.status(500).send("Failed to update wallet");
        }

        // Proceed to update the lotto table
        const sqlUpdateLotto = "UPDATE lottory SET uid = ? WHERE lottery_id = ?";
        const lottoUpdateResult = await query(sqlUpdateLotto, [userbuylotto.uid, userbuylotto.lottery_id]);

        if (lottoUpdateResult.affectedRows === 0) {
            return res.status(500).send("Failed to update lottery");
        }

        res.status(200).send("Purchase successful");
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/lottouser/:uid", async (req, res) => {
    let uid = req.params.uid;
    try {
        const sql = "SELECT * FROM lottory WHERE uid = ? AND (accepted IS NULL OR accepted = 0)";
        const result = await query(sql, [uid]);
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).send("No lottery tickets found for the user");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.put("/prize", (req, res) => {
    let prize = req.body;
    const sql = "UPDATE lottory SET accepted = ? WHERE lottery_id = ? AND uid = ?";
    conn.query(sql, [1,prize.lid,prize.uid], (err, result, fields) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        let sqlCheckWallet = "SELECT balance FROM users WHERE uid = ?"; 
        conn.query(sqlCheckWallet, [prize.uid], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal Server Error");
            }
            if (result.length === 0) {
                return res.status(404).send("User not found");
            }
            let currentWallet = result[0].wallet;
            let moneyuser = currentWallet + prize.money;
            let updateWallet = "UPDATE users SET balance = ? WHERE uid = ?";
            let sqlUpdateWallet = mysql.format(updateWallet, [moneyuser, prize.uid]);
            conn.query(sqlUpdateWallet, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Internal Server Error");
                }
                res.status(200).send("Update successful");
            });
        });
    });
});

router.post("/searchlotto", async (req, res) => {
    let search = req.body;
    if (!search.number_lotto) {
        return res.status(400).send("Missing required field: number_lotto");
    }

    try {
        // Use parameterized query to prevent SQL injection
        const sql = `
            SELECT lottery_id, price, number, prize, uid, accepted
            FROM lottory
            WHERE number LIKE ? AND accepted IS NULL
        `;
        const result = await query(sql, [`%${search.number_lotto}%`]);

        if (result.length === 0) {
            return res.status(404).send("No matching lotto found");
        }

        res.status(200).json(result);
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
