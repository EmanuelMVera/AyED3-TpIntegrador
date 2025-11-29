import { MedicalRecord } from '../models/MedicalRecord.js';
import { Pet } from '../models/Pet.js';
import { Pokemon } from '../models/Pokemon.js';
import { User } from '../models/User.js';

function isStaff(req) {
  return req.userRole === 'staff';
}

/**
 * Listar TODAS las historias clínicas (sólo staff)
 * GET /api/records
 */
export async function getAllRecords(req, res) {
  try {
    if (!isStaff(req)) {
      return res
        .status(403)
        .json({ error: 'Acceso restringido: sólo personal de la clínica.' });
    }

    const records = await MedicalRecord.findAll({
      include: [
        {
          model: Pet,
          as: 'Pet',
          attributes: ['id', 'name', 'ownerId'],
          include: [
            {
              model: Pokemon,
              as: 'Species',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'Vet',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['date', 'DESC']],
    });

    res.json(records);
  } catch (error) {
    console.error('Error al obtener todas las historias clínicas:', error);
    res.status(500).json({ error: 'Error al obtener las historias clínicas' });
  }
}

/**
 * Historias clínicas de una mascota concreta
 *  - staff: ve todas
 *  - owner: ve sólo las visibleToOwner
 * GET /api/records/pet/:petId
 */
export async function getRecordsByPet(req, res) {
  try {
    const { petId } = req.params;

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const staff = isStaff(req);
    const owner = Number(pet.ownerId) === Number(req.userId);

    if (!staff && !owner) {
      return res
        .status(403)
        .json({ error: 'No tienes acceso al historial de esta mascota' });
    }

    const where = { petId };
    if (!staff) {
      // Dueño → sólo lo marcado como visible
      where.visibleToOwner = true;
    }

    const records = await MedicalRecord.findAll({
      where,
      include: [
        {
          model: User,
          as: 'Vet',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['date', 'DESC']],
    });

    res.json(records);
  } catch (error) {
    console.error('Error al obtener historial de la mascota:', error);
    res.status(500).json({ error: 'Error al obtener el historial clínico' });
  }
}

/**
 * Detalle de una historia clínica
 *  - staff: ve todo
 *  - owner: sólo si la mascota es suya y visibleToOwner = true
 * GET /api/records/:id
 */
export async function getRecordById(req, res) {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id, {
      include: [
        {
          model: Pet,
          as: 'Pet',
          attributes: ['id', 'name', 'ownerId'],
          include: [
            {
              model: Pokemon,
              as: 'Species',
              attributes: ['id', 'name', 'imageUrl', 'types'],
            },
          ],
        },
        {
          model: User,
          as: 'Vet',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({ error: 'Historia clínica no encontrada' });
    }

    const staff = isStaff(req);
    const owner =
      record.Pet && Number(record.Pet.ownerId) === Number(req.userId);

    if (!staff) {
      if (!owner || !record.visibleToOwner) {
        return res
          .status(403)
          .json({ error: 'No tienes acceso a esta historia clínica' });
      }
    }

    res.json(record);
  } catch (error) {
    console.error('Error al obtener historia clínica:', error);
    res.status(500).json({ error: 'Error al obtener historia clínica' });
  }
}

/**
 * Crear historia clínica para una mascota
 *  - sólo staff
 * POST /api/records/pet/:petId
 * body:
 *  { title, description, weightKg?, notesForOwner?, internalNotes?, visibleToOwner? }
 */
export async function createRecordForPet(req, res) {
  try {
    if (!isStaff(req)) {
      return res
        .status(403)
        .json({ error: 'Acceso restringido: sólo personal de la clínica.' });
    }

    const { petId } = req.params;
    const { title, description, weightKg, notesForOwner, internalNotes, visibleToOwner } =
      req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: 'title y description son obligatorios' });
    }

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const record = await MedicalRecord.create({
      petId: pet.id,
      vetId: req.userId, // staff que atiende
      title,
      description,
      weightKg: weightKg ?? null,
      notesForOwner: notesForOwner ?? null,
      internalNotes: internalNotes ?? null,
      visibleToOwner:
        typeof visibleToOwner === 'boolean' ? visibleToOwner : true,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Error al crear historia clínica:', error);
    res.status(500).json({ error: 'Error al crear historia clínica' });
  }
}

/**
 * Actualizar historia clínica
 *  - sólo staff
 * PUT /api/records/:id
 */
export async function updateRecord(req, res) {
  try {
    if (!isStaff(req)) {
      return res
        .status(403)
        .json({ error: 'Acceso restringido: sólo personal de la clínica.' });
    }

    const { id } = req.params;
    const record = await MedicalRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({ error: 'Historia clínica no encontrada' });
    }

    const {
      title,
      description,
      weightKg,
      notesForOwner,
      internalNotes,
      visibleToOwner,
      date,
    } = req.body;

    if (title !== undefined) record.title = title;
    if (description !== undefined) record.description = description;
    if (weightKg !== undefined) record.weightKg = weightKg;
    if (notesForOwner !== undefined) record.notesForOwner = notesForOwner;
    if (internalNotes !== undefined) record.internalNotes = internalNotes;
    if (visibleToOwner !== undefined) record.visibleToOwner = visibleToOwner;
    if (date !== undefined) record.date = date;

    await record.save();

    res.json({ message: 'Historia clínica actualizada correctamente', record });
  } catch (error) {
    console.error('Error al actualizar historia clínica:', error);
    res.status(500).json({ error: 'Error al actualizar historia clínica' });
  }
}

/**
 * Eliminar historia clínica
 *  - sólo staff
 * DELETE /api/records/:id
 */
export async function deleteRecord(req, res) {
  try {
    if (!isStaff(req)) {
      return res
        .status(403)
        .json({ error: 'Acceso restringido: sólo personal de la clínica.' });
    }

    const { id } = req.params;
    const record = await MedicalRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({ error: 'Historia clínica no encontrada' });
    }

    await record.destroy();
    res.json({ message: 'Historia clínica eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar historia clínica:', error);
    res.status(500).json({ error: 'Error al eliminar historia clínica' });
  }
}
