import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'style_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Compatibilidad con el patrón dbConnect() de Mongoose
export async function dbConnect() {
  // El pool se conecta automáticamente, esto solo verifica la conexión
  const conn = await pool.getConnection();
  conn.release();
}

export default pool;