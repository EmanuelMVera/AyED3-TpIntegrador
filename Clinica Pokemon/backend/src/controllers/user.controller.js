import { User } from '../models/User.js';
import { Pet } from '../models/Pet.js';
import { Pokemon } from '../models/Pokemon.js';
import PDFDocument from 'pdfkit';
import bcrypt from 'bcrypt';

// ==========================================================================
//  Obtener todos los usuarios (uso interno / staff)
// ==========================================================================
export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'phone', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
}

// ==========================================================================
//  Obtener un usuario por ID (uso interno / staff)
// ==========================================================================
export async function getUserById(req, res) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'phone', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
}

// ==========================================================================
//  Actualizar usuario (nombre, email, teléfono o contraseña)
//  - El dueño podrá actualizar sus propios datos desde el front.
//  - El staff podría actualizar datos de dueños desde un panel interno.
// ==========================================================================
export async function updateUser(req, res) {
  try {
    const { username, email, phone, password } = req.body;
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // No devolvemos la contraseña, obviamente
    const { password: _pw, ...userSafe } = user.toJSON();
    res.json({ message: 'Usuario actualizado correctamente', user: userSafe });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error al actualizar usuario',
      details: error.message,
    });
  }
}

// ==========================================================================
//  Eliminar usuario (uso interno / staff)
// ==========================================================================
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}

// ==========================================================================
//  Perfil del usuario autenticado
//  - Si es owner: devuelve sus datos + mascotas (con raza Pokémon)
//  - Si es staff: devuelve sólo sus datos (Pets suele venir vacío)
// ==========================================================================
export async function getProfile(req, res) {
  try {
    const userId = req.userId; // viene de authMiddleware

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role', 'phone', 'createdAt'],
      include: [
        {
          model: Pet,
          as: 'Pets',
          include: [
            {
              model: Pokemon,
              as: 'Species',
              attributes: ['id', 'name', 'imageUrl', 'types', 'description'],
            },
          ],
        },
      ],
      order: [[{ model: Pet, as: 'Pets' }, 'createdAt', 'DESC']],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({
      error: 'Error al obtener el perfil',
      details: error.message,
    });
  }
}

// ==========================================================================
//  Generar PDF simple del perfil del usuario + sus mascotas
//  (sustituye al PDF de “entrenador con sus Pokémon creados”)
// ==========================================================================
export async function generateUserPDF(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ['username', 'email', 'role', 'phone', 'createdAt'],
      include: [
        {
          model: Pet,
          as: 'Pets',
          include: [
            {
              model: Pokemon,
              as: 'Species',
              attributes: ['name', 'types', 'description'],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `perfil_${user.username}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // --- Encabezado ---
    doc
      .fontSize(22)
      .fillColor('#ef5350')
      .text('Resumen de Cliente - Clínica Pokémon', { align: 'center' })
      .moveDown();

    // --- Datos del usuario ---
    doc
      .fontSize(14)
      .fillColor('black')
      .text(`Nombre de usuario: ${user.username}`)
      .text(`Correo electrónico: ${user.email}`)
      .text(`Rol: ${user.role}`)
      .text(`Teléfono: ${user.phone || 'No registrado'}`)
      .text(
        `Miembro desde: ${new Date(user.createdAt).toLocaleDateString('es-AR')}`
      )
      .moveDown(1.5);

    // --- Mascotas ---
    doc
      .fontSize(16)
      .fillColor('#ef5350')
      .text('Mascotas registradas:', { underline: true });

    if (user.Pets && user.Pets.length > 0) {
      user.Pets.forEach((pet, index) => {
        const speciesName = pet.Species ? pet.Species.name : 'Sin raza asociada';
        const types = pet.Species?.types?.join(', ') || '';
        const speciesDesc = pet.Species?.description || '';

        doc
          .moveDown(0.5)
          .fontSize(13)
          .fillColor('black')
          .text(`${index + 1}. ${pet.name} (${speciesName})`);

        if (types) {
          doc.fontSize(11).fillColor('#555').text(`Tipos: ${types}`);
        }

        if (speciesDesc) {
          doc
            .moveDown(0.2)
            .fontSize(11)
            .fillColor('#333')
            .text(speciesDesc, { indent: 20 });
        }
      });
    } else {
      doc.moveDown().fontSize(12).fillColor('black').text('No hay mascotas registradas.');
    }

    // --- Pie ---
    doc
      .moveDown(2)
      .fontSize(10)
      .fillColor('#777')
      .text('Generado por Clínica Pokémon © 2025', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res
      .status(500)
      .json({ error: 'Error al generar PDF', details: error.message });
  }
}
