const express = require('express');
const router = express.Router();

router.get("/randomlottory/:amount", async  (req, res) => {
  let type = 'user';
  let sqldeuser = "DELETE FROM lottory ";
  sqldeuser = mysql.format(sqldeuser);
  conn.query(sqldeuser,(err,result)=>{
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      }
      let sqldelottory = "DELETE FROM users WHERE type = ?";
      sqldelottory =  mysql.format(sqldelottory,[type]);
      conn.query(sqldelottory,async (err,result)=>{
          if (err) {
              console.error(err);
              return res.status(500).send("Internal Server Error");
          }
          let amount = +req.params.amount;
          let list = new Set(); // ใช้ Set เพื่อป้องกันการซ้ำ
  while (list.size < amount) {
      // สุ่มเลข 6 หลัก
      let randomnumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // ถ้าเลขไม่ซ้ำ ให้เพิ่มใน Set
      if (!list.has(randomnumber)) {
          list.add(randomnumber);
          try {
              await conn.query('INSERT INTO lottoryry (number) VALUES (?)', [randomnumber]);
          } catch (error) {
              console.error("Error inserting into database: ", error);
              return res.status(500).send("Error inserting into database");
          }
      }
  }
  res.status(201).send('Delete and Insert success');
      });
  });
});

router.get("/ranpriceall", async (req, res) => {

  let sqlCheck = "SELECT * FROM `lottory` WHERE `price`IN('1','2','3','4','5')"
  conn.query(sqlCheck, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      } 
      if(result.length > 1){
          return res.status(400).send("You have already drawn a random price");
      }else{
           let sql = "SELECT * from lottory";
  conn.query(sql, (err, result) => {
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
      let priceTypes = ['1', '2', '3', '4', '5'];
      for (let i = 0; i < selectedNumbers.length; i++) {
          let updatelottory = "UPDATE lottory SET price = ? WHERE number = ?";
          let sqlUpdatelottory = mysql.format(updatelottory, [priceTypes[i], selectedNumbers[i]]);
          conn.query(sqlUpdatelottory, (err, result) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send("Internal Server Error");
              }
          });      
      }
      let updateaccepted = "UPDATE lottory SET accepted = ?";
      let sqlUpdateaccepted = mysql.format(updateaccepted, [0]);
      conn.query(sqlUpdateaccepted, (err, result) => {
          if (err) {
              console.error(err);
              return res.status(500).send("Internal Server Error");
          }
          res.status(200).send("RandomNumberAll successful");
      });      
  });
      }
  });
 
});
router.get("/ranpriceuser", async (req, res) => {

  let sqlCheck = "SELECT * FROM `lottory` WHERE `price`IN('1','2','3','4','5')"
  conn.query(sqlCheck, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      } 
      if(result.length > 1){
          return res.status(400).send("You have already drawn a random price");
      }else{
          let sql = "SELECT * from lottory WHERE uid IS NOT NULL";
          conn.query(sql, (err, result) => {
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
              let priceTypes = ['1', '2', '3', '4', '5'];
              for (let i = 0; i < selectedNumbers.length; i++) {
                  let updatelottory = "UPDATE lottoryry SET price = ? WHERE number = ?";
                  let sqlUpdatelottory = mysql.format(updatelottory, [priceTypes[i], selectedNumbers[i]]);
                  conn.query(sqlUpdatelottory, (err, result) => {
                      if (err) {
                          console.error(err);
                          return res.status(500).send("Internal Server Error");
                      }
                  });      
              }
              let updateaccepted = "UPDATE lottory SET accepted = ?";
              let sqlUpdateaccepted = mysql.format(updateaccepted, [0]);
              conn.query(sqlUpdateaccepted, (err, result) => {
                  if (err) {
                      console.error(err);
                      return res.status(500).send("Internal Server Error");
                  }
                  res.status(200).send("RandomNumberAll successful");
              });      
          });
      }
  });
});

router.get("/lottory", (req, res) => {
  const sql = "SELECT * FROM lottoryry WHERE uid IS NOT NULL";
  let lenuser = 0;
  let lenall = 0;
  conn.query(sql, (err, result, fields) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      }
      lenuser = result.length;
      const sqlall = "SELECT * FROM lottory";
      conn.query(sqlall, (err, result, fields) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
      }
      lenall = result.length;
      res.status(201).json({
          lenuser : lenuser,
          lenall : lenall
      });
  });
  });
});

module.exports = router;
