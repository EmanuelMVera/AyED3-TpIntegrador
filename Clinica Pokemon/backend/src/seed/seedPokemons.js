import axios from 'axios';
import { sequelize } from '../config/db.js';
import { Pokemon } from '../models/Pokemon.js';

const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=151&offset=0';

async function seed() {
  try {
    console.log('🔄 Iniciando carga de Pokémon...');

    // Reinicia la base y sincroniza modelos
    await sequelize.sync({ force: true });

    // 1️⃣ Obtener lista base (nombre + URL de detalle)
    const { data } = await axios.get(apiUrl);
    const detailRequests = data.results.map(p => axios.get(p.url));
    const detailResponses = await Promise.all(detailRequests);

    // 2️⃣ Obtener species (para descripción) en paralelo
    const speciesRequests = detailResponses.map(r =>
      axios.get(r.data.species.url)
    );
    const speciesResponses = await Promise.all(speciesRequests);

    // 3️⃣ Combinar ambos datasets
    const pokemons = detailResponses.map((detail, i) => {
      const species = speciesResponses[i].data;

      // Buscar descripción en español o fallback en inglés
      const flavor =
        species.flavor_text_entries.find(
          e => e.language.name === 'es'
        ) ||
        species.flavor_text_entries.find(
          e => e.language.name === 'en'
        );

      // Limpiar saltos de línea y caracteres especiales
      const description = flavor
        ? flavor.flavor_text.replace(/[\n\f]/g, ' ')
        : 'Sin descripción disponible.';

      return {
        name: detail.data.name,
        imageUrl: detail.data.sprites.other['official-artwork'].front_default,
        types: detail.data.types.map(t => t.type.name),
        description,
        isUserCreated: false,
      };
    });

    // 4️⃣ Guardar en la base
    await Pokemon.bulkCreate(pokemons);
    console.log('✅ Base de datos inicializada con 151 Pokémon con descripciones.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  }
}

seed();
