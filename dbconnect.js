const mysql = require('mysql');
const util = require('util');

const conn = mysql.createPool({
    host: "202.28.34.197",
    user: "web66_65011212229",
    password: "65011212229@csmsu",
    database: "web66_65011212229"
});

const queryAsync = util.promisify(conn.query).bind(conn);

module.exports = (conn, queryAsync, mysql);