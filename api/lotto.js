const express = require('express');
const { conn, mysql } = require('../dbconnect');
const router = express.Router();
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

// GET all available lottory entries
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

// GET lottory prizes
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

// PUT user buy lottory
router.put("/userbuylottory", async (req, res) => {
    let userbuylottory = req.body;
    const pricelottory = 100; // Price of the lottery ticket

    try {
        // Check the user's balance first
        let sqlCheckbalance = "SELECT balance FROM users WHERE uid = ?";
        const balanceResult = await query(sqlCheckbalance, [userbuylottory.uid]);

        if (balanceResult.length === 0) {
            return res.status(404).send("User not found");
        }

        let currentbalance = balanceResult[0].balance;
        if (currentbalance < pricelottory) {
            return res.status(400).send("Insufficient funds");
        }

        // Update the user's balance after checking the balance
        let moneyuser = currentbalance - pricelottory;
        let updatebalance = "UPDATE users SET balance = ? WHERE uid = ?";
        await query(updatebalance, [moneyuser, userbuylottory.uid]);

        // Proceed to update the lottory table
        let sqlUpdatelottory = "UPDATE lottory SET uid = ? WHERE lottery_id = ?";
        await query(sqlUpdatelottory, [userbuylottory.uid, userbuylottory.lottery_id]);

        res.status(200).send("Purchase successful");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// POST search lottory
router.post("/searchlottory", async (req, res) => {
    let search = req.body;
    
    try {
        let sql = `
            SELECT * FROM lottory
            WHERE uid IS NULL
              AND number LIKE ?
              AND accepted IS NULL
        `;
        let formattedSearch = `${search.numlottory}`;
        sql = mysql.format(sql, [
            `%${formattedSearch}%`
        ]);

        const result = await query(sql);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Export the router
module.exports = router;
