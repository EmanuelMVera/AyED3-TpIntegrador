import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcrypt';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // "alias" o nombre de usuario
  username: { type: DataTypes.STRING, unique: true, allowNull: false },

  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },

  // rol del usuario en la clínica
  role: {
    type: DataTypes.ENUM('OWNER', 'STAFF', 'ADMIN'),
    allowNull: false,
    defaultValue: 'OWNER', // lo que se registra desde el front normal
  },

  // Datos opcionales pero útiles para la clínica
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
});

// Hasheo de contraseña
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});
