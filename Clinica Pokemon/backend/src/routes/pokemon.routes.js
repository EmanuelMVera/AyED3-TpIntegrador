import express from 'express';
import {
  getAllPokemons,
  getPokemonById,
} from '../controllers/pokemon.controller.js';

const router = express.Router();

router.get('/', getAllPokemons);
router.get('/:id', getPokemonById);

export default router;
