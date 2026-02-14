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
      attributes: ['id', 'username', 'email', 'role', 'phone', 'createdAt'],
      include: [
        {
          model: Pet,
          as: 'Pets',
          include: [
            {
              model: Pokemon,
              as: 'Species',
              attributes: ['id', 'name', 'types', 'description'],
            },
            {
              model: MedicalRecord,
              as: 'Records',
              where: { visibleToOwner: true },
              required: false,
              attributes: [
                'id',
                'date',
                'title',
                'description',
                'weightKg',
                'notesForOwner',
                'visibleToOwner',
                'createdAt',
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: Pet, as: 'Pets' }, 'name', 'ASC'],
        [
          { model: Pet, as: 'Pets' },
          { model: MedicalRecord, as: 'Records' },
          'date',
          'DESC',
        ],
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const pets = Array.isArray(user.Pets) ? user.Pets : [];

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      info: {
        Title: `Informe Clínico - ${user.username}`,
        Author: 'Clínica Pokémon',
        Subject: 'Resumen de cliente, mascotas e historial médico',
      },
    });

    const safeUsername = String(user.username || 'cliente').replace(
      /[^\w.-]/g,
      '_',
    );
    const filename = `informe_clinico_${safeUsername}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    const pageW = doc.page.width;
    const contentW = pageW - 100;

    // ----------------------------------------------------------------------
    // PORTADA
    // ----------------------------------------------------------------------
    // Fondo superior
    doc.save();
    doc.rect(0, 0, pageW, 190).fill('#0F172A');
    doc.restore();

    // Banda decorativa
    doc.save();
    doc.rect(0, 150, pageW, 40).fill('#1D4ED8');
    doc.restore();

    // Título principal
    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#FFFFFF')
      .text('INFORME CLÍNICO', 50, 52);

    doc
      .font('Helvetica')
      .fontSize(13)
      .fillColor('#BFDBFE')
      .text('Clínica Pokémon', 50, 88);

    // Tarjeta portada
    const coverCardY = 220;
    drawRoundedBox(doc, {
      x: 50,
      y: coverCardY,
      w: contentW,
      h: 185,
      fill: '#F8FAFC',
      stroke: '#E2E8F0',
      r: 14,
    });

    doc.y = coverCardY + 18;
    doc.x = 66;

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#0F172A')
      .text('Datos del cliente');

    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#111827');
    doc.text(`Usuario: ${user.username || '—'}`);
    doc.text(`Email: ${user.email || '—'}`);
    doc.text(`Rol: ${user.role || '—'}`);
    doc.text(`Teléfono: ${user.phone || 'No registrado'}`);
    doc.text(`Miembro desde: ${formatDate(user.createdAt)}`);
    doc.text(`Emitido: ${formatDateTime(new Date())}`);

    // Métricas rápidas
    const totalRecords = pets.reduce(
      (acc, p) => acc + (Array.isArray(p.Records) ? p.Records.length : 0),
      0,
    );

    const metricY = coverCardY + 122;
    const boxW = (contentW - 20) / 3;

    const drawMetric = (x, title, value, color = '#1D4ED8') => {
      drawRoundedBox(doc, {
        x,
        y: metricY,
        w: boxW,
        h: 52,
        fill: '#FFFFFF',
        stroke: '#E5E7EB',
        r: 10,
      });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#6B7280')
        .text(title, x + 10, metricY + 9);
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(color)
        .text(String(value), x + 10, metricY + 23);
    };

    drawMetric(60, 'Mascotas registradas', pets.length, '#2563EB');
    drawMetric(60 + boxW + 10, 'Informes visibles', totalRecords, '#0EA5E9');
    drawMetric(
      60 + (boxW + 10) * 2,
      'Estado',
      pets.length ? 'Activo' : 'Inicial',
      '#16A34A',
    );

    // Pie portada
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor('#6B7280')
      .text(
        'Documento confidencial de uso clínico.',
        50,
        doc.page.height - 80,
        {
          width: contentW,
          align: 'center',
        },
      );

    // ----------------------------------------------------------------------
    // PÁGINA 2: ÍNDICE
    // ----------------------------------------------------------------------
    doc.addPage();

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#0F172A')
      .text('Índice de contenido');

    doc.moveDown(0.4);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#4B5563')
      .text('Resumen de mascotas y accesos rápidos del informe.');

    doc.moveDown(1);

    drawRoundedBox(doc, {
      x: 50,
      y: doc.y,
      w: contentW,
      h: Math.max(88, 32 + pets.length * 24),
      fill: '#FFFFFF',
      stroke: '#E5E7EB',
      r: 12,
    });

    let iy = doc.y + 14;
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#111827')
      .text('Secciones', 64, iy);
    iy += 24;

    doc.font('Helvetica').fontSize(10).fillColor('#374151');
    doc.text('1. Datos del cliente', 64, iy);
    iy += 20;
    doc.text('2. Mascotas registradas', 64, iy);
    iy += 24;

    if (!pets.length) {
      doc
        .fillColor('#6B7280')
        .text('— Sin mascotas cargadas actualmente', 84, iy);
      iy += 20;
    } else {
      pets.forEach((pet, index) => {
        const recCount = Array.isArray(pet.Records) ? pet.Records.length : 0;
        doc
          .fillColor('#111827')
          .text(`2.${index + 1} ${pet.name || 'Mascota sin nombre'}`, 84, iy);
        doc
          .fillColor('#6B7280')
          .text(`(${recCount} informes visibles)`, 280, iy);
        iy += 20;
      });
    }

    doc.y = Math.max(doc.y + 120, iy + 18);

    // ----------------------------------------------------------------------
    // PÁGINAS: BLOQUES DE MASCOTAS + HISTORIAL
    // ----------------------------------------------------------------------
    doc.addPage();

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#0F172A')
      .text('Mascotas e historial médico');

    doc.moveDown(0.35);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#4B5563')
      .text(
        'Se muestran únicamente informes marcados como visibles para el dueño.',
      );

    doc.moveDown(0.8);

    if (!pets.length) {
      drawRoundedBox(doc, {
        x: 50,
        y: doc.y,
        w: contentW,
        h: 70,
        fill: '#F9FAFB',
        stroke: '#E5E7EB',
        r: 12,
      });

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#374151')
        .text('No hay mascotas registradas para este cliente.', 68, doc.y + 26);
    } else {
      for (let i = 0; i < pets.length; i++) {
        const pet = pets[i];
        const speciesName = pet?.Species?.name || 'Sin especie';
        const types = Array.isArray(pet?.Species?.types)
          ? pet.Species.types
          : [];
        const speciesDesc = pet?.Species?.description || '';
        const records = (Array.isArray(pet?.Records) ? pet.Records : [])
          .slice()
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 5);

        // Altura estimada del bloque mascota
        const petHeaderH = 150;
        const recordsH = Math.max(46, records.length * 96);
        const totalBlockH = petHeaderH + recordsH + 22;

        ensureSpace(doc, totalBlockH);

        // Card mascota
        const cardX = 50;
        const cardY = doc.y;
        const cardW = contentW;
        const cardH = petHeaderH;

        drawRoundedBox(doc, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          fill: '#FFFFFF',
          stroke: '#CBD5E1',
          r: 12,
        });

        // Título mascota
        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor('#0F172A')
          .text(
            `${i + 1}. ${pet?.name || 'Mascota sin nombre'}`,
            cardX + 14,
            cardY + 12,
          );

        // Chips/tags
        let tx = cardX + 14;
        const ty = cardY + 38;
        const t1 = drawTag(doc, `Especie: ${speciesName}`, tx, ty, {
          bg: '#DBEAFE',
          fg: '#1E40AF',
        });
        tx += t1.w + 8;
        const t2 = drawTag(doc, `Sexo: ${petSexLabel(pet?.sex)}`, tx, ty, {
          bg: '#E0E7FF',
          fg: '#3730A3',
        });
        tx += t2.w + 8;
        drawTag(doc, `Peso: ${pet?.weightKg ?? '—'} kg`, tx, ty, {
          bg: '#DCFCE7',
          fg: '#166534',
        });

        // Datos
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#374151')
          .text(
            `Nacimiento: ${formatDate(pet?.birthDate)}`,
            cardX + 14,
            cardY + 66,
          );

        if (types.length) {
          doc.text(`Tipos: ${types.join(', ')}`, cardX + 14, cardY + 82);
        }

        if (speciesDesc) {
          doc
            .font('Helvetica')
            .fontSize(9.6)
            .fillColor('#4B5563')
            .text(
              `Descripción especie: ${speciesDesc}`,
              cardX + 14,
              cardY + 100,
              {
                width: cardW - 28,
                height: 30,
                ellipsis: true,
              },
            );
        }

        // Encabezado historial
        let currentY = cardY + cardH + 10;
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#111827')
          .text('Historial médico visible (últimos 5)', cardX + 4, currentY);

        currentY += 18;

        if (!records.length) {
          drawRoundedBox(doc, {
            x: cardX + 4,
            y: currentY,
            w: cardW - 8,
            h: 42,
            fill: '#F8FAFC',
            stroke: '#E2E8F0',
            r: 10,
          });

          doc
            .font('Helvetica')
            .fontSize(9.8)
            .fillColor('#6B7280')
            .text(
              'Sin informes clínicos visibles para el dueño.',
              cardX + 16,
              currentY + 14,
            );

          currentY += 52;
        } else {
          records.forEach((r, idx) => {
            const rx = cardX + 4;
            const ry = currentY;
            const rw = cardW - 8;
            const rh = 88;

            ensureSpace(doc, rh + 18);

            drawRoundedBox(doc, {
              x: rx,
              y: ry,
              w: rw,
              h: rh,
              fill: '#F9FAFB',
              stroke: '#E5E7EB',
              r: 10,
            });

            doc
              .font('Helvetica-Bold')
              .fontSize(10.5)
              .fillColor('#111827')
              .text(
                `${idx + 1}) ${r?.title || 'Sin título'}`,
                rx + 10,
                ry + 10,
                {
                  width: rw - 20,
                  height: 16,
                  ellipsis: true,
                },
              );

            doc
              .font('Helvetica')
              .fontSize(9.2)
              .fillColor('#6B7280')
              .text(
                `Fecha: ${formatDate(r?.date)}${r?.weightKg ? ` · Peso: ${r.weightKg} kg` : ''}`,
                rx + 10,
                ry + 26,
              );

            doc
              .font('Helvetica')
              .fontSize(9.2)
              .fillColor('#374151')
              .text(r?.description || 'Sin descripción', rx + 10, ry + 40, {
                width: rw - 20,
                height: 24,
                ellipsis: true,
              });

            if (r?.notesForOwner) {
              doc
                .font('Helvetica-Oblique')
                .fontSize(9)
                .fillColor('#4B5563')
                .text(`Para el dueño: ${r.notesForOwner}`, rx + 10, ry + 64, {
                  width: rw - 20,
                  height: 16,
                  ellipsis: true,
                });
            }

            currentY += rh + 8;
          });
        }

        doc.y = currentY + 6;

        // Separador entre mascotas
        if (i < pets.length - 1) {
          doc
            .strokeColor('#E5E7EB')
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(pageW - 50, doc.y)
            .stroke();

          doc.moveDown(1);
        }
      }
    }

    // ----------------------------------------------------------------------
    // CIERRE
    // ----------------------------------------------------------------------
    ensureSpace(doc, 70);
    doc.moveDown(0.8);

    drawRoundedBox(doc, {
      x: 50,
      y: doc.y,
      w: contentW,
      h: 52,
      fill: '#EFF6FF',
      stroke: '#BFDBFE',
      r: 10,
    });

    doc
      .font('Helvetica')
      .fontSize(9.6)
      .fillColor('#1E3A8A')
      .text(
        'Este informe se genera automáticamente con los datos clínicos visibles para el dueño al momento de la descarga.',
        64,
        doc.y + 17,
        { width: contentW - 28, align: 'center' },
      );

    // Footer con numeración final
    drawFooterWithPageNumbers(doc);

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      error: 'Error al generar PDF',
      details: error.message,
    });
  }
}
