import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  getMyPets,
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} from '../controllers/pet.controller.js';

const router = express.Router();

function requireStaff(req, res, next) {
  if (req.userRole !== 'staff') {
    return res
      .status(403)
      .json({ error: 'Acceso restringido: sólo personal de la clínica.' });
  }
  next();
}

// Dueño autenticado → sus mascotas
router.get('/my', verifyToken, getMyPets);

// Staff → ver todas las mascotas
router.get('/', verifyToken, requireStaff, getAllPets);

// Detalle de mascota:
//  - staff: cualquiera
//  - owner: sólo suya (control en el controller)
router.get('/:id', verifyToken, getPetById);

// Crear mascota (staff)
router.post('/', verifyToken, requireStaff, createPet);

// Actualizar mascota (staff)
router.put('/:id', verifyToken, requireStaff, updatePet);

// Eliminar mascota (staff)
router.delete('/:id', verifyToken, requireStaff, deletePet);

export default router;
