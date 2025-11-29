import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    //logging: false,
    logging: console.log, 
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión con PostgreSQL establecida.');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}
