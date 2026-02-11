/**
 * Definición del modelo Pokémon.
 * Usamos un Type Alias para los tipos permitidos, mejorando el autocompletado.
 */
export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' 
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'steel' | 'dark' | 'fairy';

export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: PokemonType[]; // Tipado estricto en lugar de string[]
  description?: string;
  isUserCreated?: boolean;
  userId?: number;
}