import { Pet } from '../models/Pet.js';
import { Pokemon } from '../models/Pokemon.js';

/**
 * Mascotas del dueño autenticado (owner)
 * GET /api/pets/my
 */
export async function getMyPets(req, res) {
  try {
    const pets = await Pet.findAll({
      where: { ownerId: req.userId },
      include: [
        {
          model: Pokemon,
          as: 'Species',
          attributes: ['id', 'name', 'imageUrl', 'types', 'description'],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json(pets);
  } catch (error) {
    console.error('Error al obtener mascotas del dueño:', error);
    res.status(500).json({ error: 'Error al obtener tus mascotas' });
  }
}

/**
 * Listar todas las mascotas (solo staff)
 * GET /api/pets
 */
export async function getAllPets(req, res) {
  try {
    const pets = await Pet.findAll({
      include: [
        {
          model: Pokemon,
          as: 'Species',
          attributes: ['id', 'name', 'imageUrl', 'types'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(pets);
  } catch (error) {
    console.error('Error al obtener todas las mascotas:', error);
    res.status(500).json({ error: 'Error al obtener las mascotas' });
  }
}

/**
 * Detalle de una mascota
 * GET /api/pets/:id
 */
export async function getPetById(req, res) {
  try {
    const pet = await Pet.findByPk(req.params.id, {
      include: [
        {
          model: Pokemon,
          as: 'Species',
          attributes: ['id', 'name', 'imageUrl', 'types', 'description'],
        },
      ],
    });

    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    const isStaff = req.userRole === 'STAFF' || req.userRole === 'ADMIN';
    const isOwner = Number(pet.ownerId) === Number(req.userId);

    if (!isStaff && !isOwner) {
      return res.status(403).json({ error: 'No tienes acceso a esta mascota' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    res.status(500).json({ error: 'Error al obtener la mascota' });
  }
}

/**
 * Crear mascota (solo staff/admin)
 * POST /api/pets
 */
export async function createPet(req, res) {
  try {
    const {
      name,
      ownerId,
      speciesId,
      birthDate,
      sex,
      weightKg,
      notes,
      photoUrl,
    } = req.body;

    if (!name || !ownerId || !speciesId) {
      return res.status(400).json({
        error: 'name, ownerId y speciesId son obligatorios',
      });
    }

    const normalizedSex =
      sex === 'M' || sex === 'F' || sex === 'UNKNOWN' ? sex : 'UNKNOWN';

    // Si no vino photoUrl, tomamos imageUrl de especie automáticamente
    let finalPhotoUrl = photoUrl ?? null;
    if (!finalPhotoUrl) {
      const species = await Pokemon.findByPk(speciesId, {
        attributes: ['imageUrl'],
      });
      finalPhotoUrl = species?.imageUrl ?? null;
    }

    const pet = await Pet.create({
      name: String(name).trim(),
      ownerId: Number(ownerId),
      speciesId: Number(speciesId),
      birthDate: birthDate || null,
      sex: normalizedSex,
      weightKg: weightKg ?? null,
      notes: notes ?? null,
      photoUrl: finalPhotoUrl,
    });

    res.status(201).json(pet);
  } catch (error) {
    console.error('Error al crear mascota:', error);
    res.status(500).json({ error: 'Error al crear la mascota' });
  }
}

/**
 * Actualizar mascota (solo staff/admin)
 * PUT /api/pets/:id
 */
export async function updatePet(req, res) {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    const {
      name,
      ownerId,
      speciesId,
      birthDate,
      sex,
      weightKg,
      notes,
      photoUrl,
    } = req.body;

    if (name !== undefined) pet.name = String(name).trim();
    if (ownerId !== undefined) pet.ownerId = Number(ownerId);
    if (speciesId !== undefined) pet.speciesId = Number(speciesId);
    if (birthDate !== undefined) pet.birthDate = birthDate || null;
    if (weightKg !== undefined) pet.weightKg = weightKg ?? null;
    if (notes !== undefined) pet.notes = notes ?? null;
    if (photoUrl !== undefined) pet.photoUrl = photoUrl ?? null;

    if (sex !== undefined) {
      pet.sex = sex === 'M' || sex === 'F' || sex === 'UNKNOWN' ? sex : 'UNKNOWN';
    }

    // Si cambias speciesId y no hay photoUrl explícita, refresca por species
    if (speciesId !== undefined && photoUrl === undefined) {
      const species = await Pokemon.findByPk(Number(speciesId), {
        attributes: ['imageUrl'],
      });
      pet.photoUrl = species?.imageUrl ?? pet.photoUrl;
    }

    await pet.save();
    res.json({ message: 'Mascota actualizada correctamente', pet });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ error: 'Error al actualizar la mascota' });
  }
}

/**
 * Eliminar mascota (solo staff/admin)
 * DELETE /api/pets/:id
 */
export async function deletePet(req, res) {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    await pet.destroy();
    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ error: 'Error al eliminar la mascota' });
  }
}
