import { Pokemon } from '../models/Pokemon.js';

export async function getAllPokemons(req, res) {
  try {
    const pokemons = await Pokemon.findAll();
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las razas' });
  }
}

export async function getPokemonById(req, res) {
  try {
    const pokemon = await Pokemon.findByPk(req.params.id);
    if (!pokemon) return res.status(404).json({ error: 'Raza no encontrada' });
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la raza' });
  }
}
