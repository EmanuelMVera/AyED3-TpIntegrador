import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  getAllRecords,
  getRecordsByPet,
  getRecordById,
  createRecordForPet,
  updateRecord,
  deleteRecord,
} from '../controllers/medicalRecord.controller.js';

const router = express.Router();

// Todas las historias (sólo staff → se chequea dentro del controller)
router.get('/', verifyToken, getAllRecords);

// Historial de una mascota concreta
router.get('/pet/:petId', verifyToken, getRecordsByPet);

// Detalle de una historia por ID
router.get('/:id', verifyToken, getRecordById);

// Crear historia para una mascota (sólo staff → chequeo dentro)
router.post('/pet/:petId', verifyToken, createRecordForPet);

// Actualizar historia (sólo staff)
router.put('/:id', verifyToken, updateRecord);

// Eliminar historia (sólo staff)
router.delete('/:id', verifyToken, deleteRecord);

export default router;
