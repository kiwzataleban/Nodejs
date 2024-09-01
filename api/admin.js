const express = require('express');
const { conn , mysql } = require('../dbconnect');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);

const router = express.Router();

router.get("/randomlottory/:amount", async (req, res) => {
  try {
      let type = 'user';
      let sqldeuser = "DELETE FROM lottory";
      await query(sqldeuser);

      let sqldelottory = "DELETE FROM users WHERE type = ?";
      await query(sqldelottory, [type]);

      let amount = +req.params.amount;
      let list = new Set();  // Use Set to prevent duplicates
      while (list.size < amount) {
          let randomnumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
          if (!list.has(randomnumber)) {
              list.add(randomnumber);
              await query('INSERT INTO lottory (number) VALUES (?)', [randomnumber]);
          }
      }
      res.status(201).send('Delete and Insert success');
  } catch (error) {
      console.error("Error during database operations: ", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get("/ranprizeall", async (req, res) => {
  let sqlCheck = "SELECT * FROM `lottory` WHERE `prize` IN ('1', '2', '3', '4', '5')";
  
  conn.query(sqlCheck, (err, result) => {
    if (err) {
      console.error("Error checking prizes:", err);
      return res.status(500).send("Internal Server Error");
    }
    
    if (result.length > 0) {
      return res.status(400).send("You have already drawn a random prize");
    }
    
    let sql = "SELECT * FROM lottory";
    
    conn.query(sql, async (err, result) => {
      if (err) {
        console.error("Error retrieving data:", err);
        return res.status(500).send("Internal Server Error");
      }
      
      if (result.length < 5) {
        return res.status(400).send("Not enough data to select 5 unique numbers");
      }
      
      let selectedNumbers = [];
      while (selectedNumbers.length < 5) {
        let randomIndex = Math.floor(Math.random() * result.length);
        let selectedNumber = result[randomIndex].number;
        if (!selectedNumbers.includes(selectedNumber)) {
          selectedNumbers.push(selectedNumber);
        }
      }
      
      let prizeTypes = ['1', '2', '3', '4', '5'];
      
      try {
        for (let i = 0; i < selectedNumbers.length; i++) {
          let updatelottory = "UPDATE lottory SET prize = ? WHERE number = ?";
          let sqlUpdatelottory = mysql.format(updatelottory, [prizeTypes[i], selectedNumbers[i]]);
          await new Promise((resolve, reject) => {
            conn.query(sqlUpdatelottory, (err, result) => {
              if (err) {
                console.error("Error updating prize:", err);
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        }
        
        let updateaccepted = "UPDATE lottory SET accepted = ?";
        let sqlUpdateaccepted = mysql.format(updateaccepted, [0]);
        await new Promise((resolve, reject) => {
          conn.query(sqlUpdateaccepted, (err, result) => {
            if (err) {
              console.error("Error updating accepted column:", err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        
        res.status(200).send("RandomNumberAll successful");
      } catch (error) {
        console.error("Error during database update:", error);
        res.status(500).send("Error updating database");
      }
    });
  });
});


router.get("/ranprizeuser", async (req, res) => {
  let sqlCheck = "SELECT * FROM `lottory` WHERE `prize` IN ('1', '2', '3', '4', '5')";
  conn.query(sqlCheck, async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    if (result.length > 0) {  // Adjusted to 0 to allow checking for already drawn prizes
      return res.status(400).send("You have already drawn a random prize");
    } else {
      let sql = "SELECT * FROM lottory WHERE uid IS NOT NULL";
      conn.query(sql, async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        
        if (result.length < 5) {
          return res.status(400).send("Not enough data to select 5 unique numbers");
        }
        
        let selectedNumbers = [];
        while (selectedNumbers.length < 5) {
          let randomIndex = Math.floor(Math.random() * result.length);
          let selectedNumber = result[randomIndex].number;
          if (!selectedNumbers.includes(selectedNumber)) {
            selectedNumbers.push(selectedNumber);
          }
        }
        
        let prizeTypes = ['1', '2', '3', '4', '5'];
        try {
          for (let i = 0; i < selectedNumbers.length; i++) {
            let updatelottory = "UPDATE lottory SET prize = ? WHERE number = ?";
            let sqlUpdatelottory = mysql.format(updatelottory, [prizeTypes[i], selectedNumbers[i]]);
            await new Promise((resolve, reject) => {
              conn.query(sqlUpdatelottory, (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
          }
          
          let updateaccepted = "UPDATE lottory SET accepted = ?";
          let sqlUpdateaccepted = mysql.format(updateaccepted, [0]);
          await new Promise((resolve, reject) => {
            conn.query(sqlUpdateaccepted, (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
          
          res.status(200).send("RandomNumberAll successful");
        } catch (error) {
          console.error("Error updating database: ", error);
          res.status(500).send("Error updating database");
        }
      });
    }
  });
});

router.get("/lottory", (req, res) => {
  const sql = "SELECT * FROM lottory WHERE uid IS NOT NULL";
  let lenuser = 0;
  let lenall = 0;
  conn.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      }
      lenuser = result.length;
      const sqlall = "SELECT * FROM lottory";
      conn.query(sqlall, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      }
      lenall = result.length;
      res.status(201).json({
          lenuser: lenuser,
          lenall: lenall
      });
  });
  });
});


module.exports = router;
