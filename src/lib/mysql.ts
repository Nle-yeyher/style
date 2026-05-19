import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // usuario por defecto en XAMPP
  password: '',       // contraseña vacía por defecto en XAMPP
  database: 'style_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;