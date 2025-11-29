/*
 * Archivo: pokemon.model.ts
 * Descripción: Define la interfaz de datos para la entidad 'Pokémon' dentro de la aplicación.
 * Esta interfaz asegura una estructura de datos consistente para los objetos Pokémon,
 * tanto para aquellos obtenidos de APIs externas como para los creados por el usuario.
 */

/**
 * @interface Pokemon
 * @description Representa la estructura de datos de un Pokémon en la aplicación.
 * Define las propiedades esenciales y opcionales que un objeto Pokémon debe tener.
 */
export interface Pokemon {
  /**
   * @property id
   * @description El identificador único del Pokémon.
   * Para Pokémon de la API, suele ser su número en la Pokédex.
   */
  id: number;

  /**
   * @property name
   * @description El nombre del Pokémon.
   */
  name: string;

  /**
   * @property imageUrl
   * @description La URL de la imagen principal del Pokémon.
   */
  imageUrl: string;

  /**
   * @property types
   * @description Un array de strings que representa los tipos del Pokémon (ej. ['grass', 'poison']).
   */
  types: string[]; // Array de strings (ej. ['grass', 'poison'])

  /**
   * @property description
   * @description Una descripción opcional del Pokémon.
   * Principalmente utilizada para los Pokémon creados por el usuario.
   */
  description?: string; // Opcional, para los Pokémon creados por el usuario

  /**
   * @property isUserCreated
   * @description Un flag opcional que indica si el Pokémon fue creado por el usuario.
   * Si es `true`, fue creado por el usuario; si es `false` o no está presente,
   * se asume que proviene de una fuente externa (ej. API).
   */
  isUserCreated?: boolean; // Opcional, para identificar Pokémon creados por el usuario

  userId?: number; // Opcional, ID del usuario que creó el Pokémon
}
