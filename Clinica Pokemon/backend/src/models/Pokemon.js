import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Pokemon = sequelize.define('Pokemon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },            // especie (Bulbasaur, etc.)
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  types: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
  description: { type: DataTypes.TEXT },

  // Ya no se usa, borrar luego
  isUserCreated: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
});
