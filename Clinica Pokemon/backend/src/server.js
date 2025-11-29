import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB, sequelize } from './config/db.js';

// Modelos
import { Pokemon } from './models/Pokemon.js';
import { User } from './models/User.js';
import { Pet } from './models/Pet.js';
import { MedicalRecord } from './models/MedicalRecord.js';

// Rutas
import pokemonRoutes from './routes/pokemon.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import petRoutes from './routes/pet.routes.js';
import recordRoutes from './routes/medicalRecord.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/pokemons', pokemonRoutes); // catálogo de especies
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/records', recordRoutes);

// ==================
//   RELACIONES
// ==================

// User (OWNER) 1---N Pet
User.hasMany(Pet, { foreignKey: 'ownerId', as: 'Pets' });
Pet.belongsTo(User, { foreignKey: 'ownerId', as: 'Owner' });

// PokemonSpecies 1---N Pet
Pokemon.hasMany(Pet, { foreignKey: 'speciesId', as: 'PetsOfSpecies' });
Pet.belongsTo(Pokemon, { foreignKey: 'speciesId', as: 'Species' });

// User (STAFF) 1---N MedicalRecord (vetId)
User.hasMany(MedicalRecord, { foreignKey: 'vetId', as: 'VetRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'vetId', as: 'Vet' });

// Pet 1---N MedicalRecord
Pet.hasMany(MedicalRecord, { foreignKey: 'petId', as: 'Records' });
MedicalRecord.belongsTo(Pet, { foreignKey: 'petId', as: 'Pet' });

// ==================
//   DB
// ==================
await connectDB();

// En desarrollo, usar { alter: true } para agregar columnas nuevas
await sequelize.sync({ alter: true });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
