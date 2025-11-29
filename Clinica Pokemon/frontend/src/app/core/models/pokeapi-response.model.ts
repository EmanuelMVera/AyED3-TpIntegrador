/*
 * Archivo: pokeapi-response.model.ts
 * Descripción: Define las interfaces de datos para las respuestas esperadas
 * de la PokeAPI. Estas interfaces tipifican la estructura de los objetos
 * recibidos de la API externa, facilitando la manipulación segura de datos
 * y el desarrollo en TypeScript.
 */

/**
 * @interface PokeApiPokemonTypeEntry
 * @description Representa una entrada de tipo de Pokémon tal como se recibe de la PokeAPI.
 * Contiene el 'slot' del tipo y la información detallada del tipo (nombre y URL).
 */
export interface PokeApiPokemonTypeEntry {
  /**
   * @property slot
   * @description El slot (posición) del tipo en la lista de tipos del Pokémon.
   * (ej. 1 para el tipo principal, 2 para el tipo secundario).
   */
  slot: number;

  /**
   * @property type
   * @description Objeto que contiene el nombre y la URL del tipo de Pokémon.
   */
  type: {
    name: string; // El nombre del tipo (ej. 'grass', 'fire')
    url: string; // URL a la información detallada del tipo
  };
}

/**
 * @interface PokeApiPokemonSprites
 * @description Define la estructura de los sprites (imágenes) de un Pokémon
 * tal como se reciben de la PokeAPI. Incluye las URLs de las imágenes
 * frontal y trasera por defecto, y las imágenes de 'official-artwork'.
 */
export interface PokeApiPokemonSprites {
  /**
   * @property front_default
   * @description URL de la imagen frontal por defecto del Pokémon. Puede ser `null`.
   */
  front_default: string | null;

  /**
   * @property back_default
   * @description URL de la imagen trasera por defecto del Pokémon. Puede ser `null`.
   */
  back_default: string | null;

  /**
   * @property other
   * @description Contiene sprites adicionales, como el arte oficial.
   */
  other: {
    /**
     * @property official-artwork
     * @description Contiene la URL de la imagen de arte oficial del Pokémon.
     */
    'official-artwork': {
      front_default: string | null; // URL de la imagen de arte oficial frontal
    };
  };
}

/**
 * @interface PokeApiPokemonDetail
 * @description Representa la respuesta detallada de un Pokémon individual de la PokeAPI.
 * Incluye información básica, sprites y tipos.
 */
export interface PokeApiPokemonDetail {
  /**
   * @property id
   * @description El identificador único del Pokémon en la PokeAPI.
   */
  id: number;

  /**
   * @property name
   * @description El nombre del Pokémon.
   */
  name: string;

  /**
   * @property sprites
   * @description Objeto que contiene las URLs de las diferentes imágenes del Pokémon.
   */
  sprites: PokeApiPokemonSprites;

  /**
   * @property types
   * @description Un array de objetos que describen los tipos del Pokémon.
   * Utiliza la interfaz `PokeApiPokemonTypeEntry`.
   */
  types: PokeApiPokemonTypeEntry[];

  // Propiedades opcionales que podrían ser de interés pero no son esenciales para la aplicación actual:
  // height?: number; // La altura del Pokémon en decimetros
  // weight?: number; // El peso del Pokémon en hectogramos
  // species?: { name: string; url: string; }; // Información de la especie del Pokémon
  // abilities?: any[]; // Lista de habilidades del Pokémon
}

/**
 * @interface PokeApiPokemonListResponse
 * @description Representa la estructura de una respuesta de lista paginada de Pokémon de la PokeAPI.
 * Contiene el número total de resultados, enlaces para la siguiente/anterior página,
 * y la lista de Pokémon en la página actual.
 */
export interface PokeApiPokemonListResponse {
  /**
   * @property count
   * @description El número total de recursos disponibles (Pokémon).
   */
  count: number;

  /**
   * @property next
   * @description URL de la próxima página de resultados, o `null` si no hay más páginas.
   */
  next: string | null;

  /**
   * @property previous
   * @description URL de la página anterior de resultados, o `null` si es la primera página.
   */
  previous: string | null;

  /**
   * @property results
   * @description Un array de objetos que contienen el nombre y la URL de cada Pokémon en la lista actual.
   */
  results: {
    name: string; // El nombre del Pokémon
    url: string; // URL a los detalles de este Pokémon
  }[];
}

/**
 * @interface PokeApiPokemonSpecies
 * @description Representa la respuesta de los datos de la especie de un Pokémon de la PokeAPI.
 * Principalmente utilizado para obtener las descripciones ('flavor_text_entries').
 */
export interface PokeApiPokemonSpecies {
  /**
   * @property flavor_text_entries
   * @description Un array de objetos que contienen descripciones textuales del Pokémon
   * en diferentes idiomas y versiones de juego.
   */
  flavor_text_entries: {
    flavor_text: string; // El texto descriptivo del Pokémon
    language: {
      name: string; // El idioma del texto (ej. 'en', 'es')
      url: string;
    };
    version: {
      name: string; // La versión del juego a la que pertenece la descripción (ej. 'red', 'blue')
      url: string;
    };
  }[];

  // Propiedades opcionales adicionales de la API que pueden ser exploradas:
  // base_happiness?: number;
  // capture_rate?: number;
  // egg_groups?: any[];
  // evolution_chain?: { url: string; };
  // habitat?: { name: string; url: string; };
  // growth_rate?: { name: string; url: string; };
}