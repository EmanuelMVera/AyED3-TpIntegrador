/**
 * Estructuras de datos para las respuestas de PokeAPI.
 */

export interface PokeApiPokemonTypeEntry {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokeApiPokemonSprites {
  front_default: string | null;
  back_default: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
    };
  };
}

export interface PokeApiPokemonDetail {
  id: number;
  name: string;
  sprites: PokeApiPokemonSprites;
  types: PokeApiPokemonTypeEntry[];
}

export interface PokeApiPokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokeApiFlavorText {
  flavor_text: string;
  language: { name: string; url: string };
  version: { name: string; url: string };
}

export interface PokeApiPokemonSpecies {
  flavor_text_entries: PokeApiFlavorText[];
}

  // Propiedades opcionales adicionales de la API que pueden ser exploradas:
  // base_happiness?: number;
  // capture_rate?: number;
  // egg_groups?: any[];
  // evolution_chain?: { url: string; };
  // habitat?: { name: string; url: string; };
  // growth_rate?: { name: string; url: string; };
