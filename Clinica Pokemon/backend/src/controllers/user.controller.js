import { User } from '../models/User.js';
import { Pet } from '../models/Pet.js';
import { Pokemon } from '../models/Pokemon.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import PDFDocument from 'pdfkit';
import bcrypt from 'bcrypt';

// ==========================================================================
//  Obtener todos los usuarios (uso interno / staff)
// ==========================================================================
export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
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
      attributes: { exclude: ['password'] },
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
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

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
// ==========================================================================
export async function getProfile(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
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
//  Helpers PDF
// ==========================================================================
function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR');
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR');
}

function ensureSpace(doc, neededHeight = 120) {
  if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom - 30) {
    doc.addPage();
  }
}

function drawRoundedBox(
  doc,
  { x, y, w, h, r = 10, fill = '#FFFFFF', stroke = '#E5E7EB' },
) {
  doc.save();
  doc.roundedRect(x, y, w, h, r).fillAndStroke(fill, stroke);
  doc.restore();
}

function drawTag(doc, text, x, y, opts = {}) {
  const bg = opts.bg || '#EEF2FF';
  const fg = opts.fg || '#3730A3';
  const paddingX = 8;
  const paddingY = 4;
  const fontSize = 8.8;

  doc.save();
  doc.font('Helvetica').fontSize(fontSize);
  const textW = doc.widthOfString(text);
  const tagW = textW + paddingX * 2;
  const tagH = fontSize + paddingY * 2;

  doc.roundedRect(x, y, tagW, tagH, 8).fill(bg);
  doc.fillColor(fg).text(text, x + paddingX, y + paddingY - 1);
  doc.restore();

  return { w: tagW, h: tagH };
}

function drawFooterWithPageNumbers(doc) {
  const range = doc.bufferedPageRange(); // { start, count }

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const current = i - range.start + 1;
    const total = range.count;

    const footerY = doc.page.height - 35;
    doc.save();

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6B7280')
      .text('Clínica Pokémon · Informe clínico', 50, footerY, {
        width: doc.page.width - 100,
        align: 'left',
      });

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6B7280')
      .text(`Página ${current} de ${total}`, 50, footerY, {
        width: doc.page.width - 100,
        align: 'right',
      });

    doc.restore();
  }
}

function petSexLabel(sex) {
  if (sex === 'M') return 'Macho';
  if (sex === 'F') return 'Hembra';
  return 'Desconocido';
}

// ==========================================================================
//  Generar PDF Premium del perfil + mascotas + historial visible al dueño
// ==========================================================================
export async function generateUserPDF(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Pet,
          as: 'Pets',
          include: [
            { model: Pokemon, as: 'Species' },
            {
              model: MedicalRecord,
              as: 'Records',
              where: { visibleToOwner: true },
              required: false,
            },
          ],
        },
      ],
      order: [
        [{ model: Pet, as: 'Pets' }, 'name', 'ASC'],
        [{ model: Pet, as: 'Pets' }, { model: MedicalRecord, as: 'Records' }, 'date', 'DESC'],
      ],
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const pets = Array.isArray(user.Pets) ? user.Pets : [];
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

    // Nombre de archivo profesional
    const filename = `informe_clinico_${user.lastName}_${user.firstName}.pdf`.replace(/\s+/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    const pageW = doc.page.width;
    const contentW = pageW - 100;

    // --- PORTADA ---
    doc.save().rect(0, 0, pageW, 190).fill('#0F172A').restore();
    doc.save().rect(0, 150, pageW, 40).fill('#1D4ED8').restore();

    doc.font('Helvetica-Bold').fontSize(26).fillColor('#FFFFFF').text('INFORME CLÍNICO', 50, 52);
    doc.font('Helvetica').fontSize(13).fillColor('#BFDBFE').text('Clínica Pokémon', 50, 88);

    const coverCardY = 220;
    drawRoundedBox(doc, { x: 50, y: coverCardY, w: contentW, h: 160, fill: '#F8FAFC', stroke: '#E2E8F0', r: 14 });

    doc.y = coverCardY + 18;
    doc.x = 66;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0F172A').text('Datos del cliente');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#111827');
    
    // CAMBIO: Nombre y Apellido en lugar de Username, y quitamos Rol
    doc.text(`Cliente: ${user.firstName} ${user.lastName}`);
    doc.text(`Email: ${user.email || '—'}`);
    doc.text(`Teléfono: ${user.phone || 'No registrado'}`);
    doc.text(`Miembro desde: ${formatDate(user.createdAt)}`);
    doc.text(`Fecha de emisión: ${formatDateTime(new Date())}`);

    // --- PÁGINA 2: ÍNDICE ---
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#0F172A').text('Índice de contenido');
    doc.moveDown(1);

    const indexRowHeight = 22;
    const indexBoxHeight = 50 + (pets.length * indexRowHeight);
    const startIdxY = doc.y;

    drawRoundedBox(doc, { x: 50, y: startIdxY, w: contentW, h: Math.max(60, indexBoxHeight), r: 12 });
    
    let iy = startIdxY + 15;
    doc.font('Helvetica-Bold').fontSize(11).text('Mascotas registradas', 64, iy);
    iy += 25;

    pets.forEach((pet, index) => {
      doc.font('Helvetica').fontSize(10).fillColor('#111827').text(`${index + 1}. ${pet.name}`, 84, iy);
      const count = pet.Records?.length || 0;
      doc.fillColor('#6B7280').text(`(${count} informes)`, 280, iy);
      iy += indexRowHeight;
    });

    // --- PÁGINAS DE CONTENIDO ---
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#0F172A').text('Detalle de Mascotas');
    doc.moveDown(1);

    for (const pet of pets) {
      // Solo saltamos si estamos muy al final de la página (menos de 150pt)
      ensureSpace(doc, 150);
      
      const cardY = doc.y;
      drawRoundedBox(doc, { x: 50, y: cardY, w: contentW, h: 130, stroke: '#CBD5E1', r: 12 });

      doc.font('Helvetica-Bold').fontSize(14).fillColor('#0F172A').text(pet.name, 64, cardY + 15);

      let tx = 64;
      const t1 = drawTag(doc, `Especie: ${pet.Species?.name}`, tx, cardY + 40, { bg: '#DBEAFE', fg: '#1E40AF' });
      drawTag(doc, `Sexo: ${petSexLabel(pet.sex)}`, tx + t1.w + 8, cardY + 40, { bg: '#E0E7FF', fg: '#3730A3' });

      // Notas iniciales del Pokémon
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151').text('Nota de registro:', 64, cardY + 70);
      doc.font('Helvetica').fontSize(9).fillColor('#4B5563').text(pet.notes || 'Sin notas iniciales.', 64, cardY + 82, { width: contentW - 40 });

      doc.y = cardY + 145;

      // Registros Médicos
      const records = (pet.Records || []).slice(0, 5);
      if (records.length > 0) {
        doc.font('Helvetica-Bold').fontSize(11).text('Últimos informes:', 55);
        doc.moveDown(0.5);

        for (const r of records) {
          ensureSpace(doc, 80);
          const ry = doc.y;
          drawRoundedBox(doc, { x: 55, y: ry, w: contentW - 10, h: 70, fill: '#F9FAFB', r: 8 });

          doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text(r.title, 65, ry + 10);
          doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text(`${formatDate(r.date)} - Peso: ${r.weightKg}kg`, 65, ry + 25);
          doc.fillColor('#374151').text(r.description, 65, ry + 40, { width: contentW - 40, height: 20, ellipsis: true });
          
          doc.y = ry + 80;
        }
      }
      doc.moveDown(2);
    }

    drawFooterWithPageNumbers(doc);
    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generando PDF');
  }
}
