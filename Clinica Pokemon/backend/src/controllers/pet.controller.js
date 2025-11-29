import { Pet } from '../models/Pet.js';
import { Pokemon } from '../models/Pokemon.js';

/**
 * Mascotas del dueño autenticado (owner)
 * GET /api/pets/my
 */
export async function getMyPets(req, res) {
  try {
    const pets = await Pet.findAll({
      where: { ownerId: req.userId }, // viene del authMiddleware
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
 *  - staff: puede ver cualquier mascota
 *  - owner: solo puede ver si es suya
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

    const isStaff = req.userRole === 'staff';
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
 * Crear mascota
 *  - solo staff
 * body esperado:
 *  { name, nickname?, birthDate?, weightKg?, heightCm?, notes?, ownerId, pokemonId }
 * POST /api/pets
 */
export async function createPet(req, res) {
  try {
    const {
      name,
      nickname,
      birthDate,
      weightKg,
      heightCm,
      notes,
      ownerId,
      pokemonId,
    } = req.body;

    if (!name || !ownerId || !pokemonId) {
      return res
        .status(400)
        .json({ error: 'name, ownerId y pokemonId son obligatorios' });
    }

    const pet = await Pet.create({
      name,
      nickname,
      birthDate,
      weightKg,
      heightCm,
      notes,
      ownerId,
      pokemonId,
    });

    res.status(201).json(pet);
  } catch (error) {
    console.error('Error al crear mascota:', error);
    res.status(500).json({ error: 'Error al crear la mascota' });
  }
}

/**
 * Actualizar mascota
 *  - solo staff
 * PUT /api/pets/:id
 */
export async function updatePet(req, res) {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    const {
      name,
      nickname,
      birthDate,
      weightKg,
      heightCm,
      notes,
      ownerId,
      pokemonId,
    } = req.body;

    if (name !== undefined) pet.name = name;
    if (nickname !== undefined) pet.nickname = nickname;
    if (birthDate !== undefined) pet.birthDate = birthDate;
    if (weightKg !== undefined) pet.weightKg = weightKg;
    if (heightCm !== undefined) pet.heightCm = heightCm;
    if (notes !== undefined) pet.notes = notes;
    if (ownerId !== undefined) pet.ownerId = ownerId;
    if (pokemonId !== undefined) pet.pokemonId = pokemonId;

    await pet.save();
    res.json({ message: 'Mascota actualizada correctamente', pet });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ error: 'Error al actualizar la mascota' });
  }
}

/**
 * Eliminar mascota
 *  - solo staff
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
