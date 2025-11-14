const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '34.74.157.230',
  user: 'Team5@34.74.157.230',
  password: 'Team05!!',
  database: 'chess'
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error',err);
    return;
  }
  console.log('MySQL connected as id ' + connection.thread(Id));
});
module.exports = connection;
