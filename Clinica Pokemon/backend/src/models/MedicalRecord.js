import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  petId: { type: DataTypes.INTEGER, allowNull: false },  // Paciente
  vetId: { type: DataTypes.INTEGER, allowNull: false },  // Usuario STAFF que atendió

  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

  title: { type: DataTypes.STRING, allowNull: false },       // "Consulta general"
  description: { type: DataTypes.TEXT, allowNull: false },   // detalle clínico

  weightKg: { type: DataTypes.FLOAT, allowNull: true },

  notesForOwner: { type: DataTypes.TEXT, allowNull: true },  // lo que ve el dueño
  internalNotes: { type: DataTypes.TEXT, allowNull: true },  // solo staff

  visibleToOwner: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});
