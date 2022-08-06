let mysql = require('mysql');
const db = mysql.createConnection({
	host     : 'localhost',
	user     : 'kim',
	password : 'kim0617',
	database : 'opentutorials'
});

module.exports = db;