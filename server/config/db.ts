import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_pulse_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully to:', process.env.DB_NAME || 'finance_pulse_db');
    connection.release();
    return true;
  } catch (error: any) {
    console.warn('⚠️ MySQL Connection warning:', error.message);
    console.warn('💡 Tip: Ensure MySQL server (e.g. XAMPP / WAMP / MySQL Service) is running on port 3306.');
    return false;
  }
}
