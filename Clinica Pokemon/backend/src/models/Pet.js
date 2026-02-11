import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Pet = sequelize.define('Pet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  speciesId: { type: DataTypes.INTEGER, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: true },
  sex: {
    type: DataTypes.ENUM('M', 'F', 'UNKNOWN'),
    allowNull: false,
    defaultValue: 'UNKNOWN',
  },
  weightKg: { type: DataTypes.FLOAT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
});
