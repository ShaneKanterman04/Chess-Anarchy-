const mysql = require('mysql2');

const chess_db = mysql.createPool({
  host : '34.74.157.230',
  user : 'Team5',
  password: 'Team05!!',
  database: 'chess',
  connectionLimit: '10'

});

