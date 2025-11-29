// src/controllers/auth.controller.js
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },   // 🔴 IMPORTANTE: incluye role
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );
}

/**
 * Registro de usuario (dueño por defecto)
 */
export async function register(req, res) {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
    } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'El correo ya está registrado' });
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      role: 'OWNER', // 🔴 explícito, no dependés sólo del default
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(400).json({
      error: 'Error al registrar usuario',
      details: error.message,
    });
  }
}

/**
 * Login de usuario
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = signToken(user);

    res.json({
      message: 'Login exitoso',
      token,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error en el login',
      details: error.message,
    });
  }
}
