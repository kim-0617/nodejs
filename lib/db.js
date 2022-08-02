let mysql = require('mysql');
const db = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'kim',
	password : 'kim0617',
	database : 'opentutorials'
});

module.exports = db;