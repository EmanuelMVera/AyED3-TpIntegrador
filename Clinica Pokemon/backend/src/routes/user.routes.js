import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  generateUserPDF,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Middleware simple para restringir a staff
 */
function requireStaff(req, res, next) {
  if (req.userRole !== 'staff') {
    return res
      .status(403)
      .json({ error: 'Acceso restringido: sólo personal de la clínica.' });
  }
  next();
}

/**
 * Middleware para permitir:
 *  - staff: puede editar cualquier usuario
 *  - owner: sólo puede editar su propio usuario (req.params.id)
 */
function canEditUser(req, res, next) {
  const isStaff = req.userRole === 'staff';
  const isSelf = Number(req.params.id) === Number(req.userId);

  if (!isStaff && !isSelf) {
    return res.status(403).json({
      error: 'No tienes permisos para modificar este usuario.',
    });
  }

  next();
}

// ---------------------------------------------------------------------------
//  Perfil del usuario autenticado
// ---------------------------------------------------------------------------

// Datos del usuario logueado (owner o staff)
router.get('/me', verifyToken, getProfile);

// PDF del usuario logueado (resumen de cliente/mis mascotas)
router.get('/me/pdf', verifyToken, generateUserPDF);

// ---------------------------------------------------------------------------
//  Rutas de administración de usuarios (panel interno)
// ---------------------------------------------------------------------------

// Listar todos los usuarios (sólo staff)
router.get('/', verifyToken, requireStaff, getAllUsers);

// Obtener usuario por ID (sólo staff)
router.get('/:id', verifyToken, requireStaff, getUserById);

// Actualizar usuario:
//  - staff puede actualizar cualquiera
//  - owner sólo puede actualizar su propio usuario
router.put('/:id', verifyToken, canEditUser, updateUser);

// Eliminar usuario (sólo staff)
router.delete('/:id', verifyToken, requireStaff, deleteUser);

export default router;
