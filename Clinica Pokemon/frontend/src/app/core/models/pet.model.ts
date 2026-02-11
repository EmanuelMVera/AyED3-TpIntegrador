import type { Pokemon } from './pokemon.model';

export type PetSex = 'M' | 'F' | 'UNKNOWN';

export interface Pet {
  id: number;
  name: string;
  ownerId: number;
  speciesId: number;

  birthDate?: string | null; // DATEONLY (yyyy-mm-dd)
  sex: PetSex;
  weightKg?: number | null;
  notes?: string | null;
  photoUrl?: string | null;

  createdAt?: string;
  updatedAt?: string;

  // Relaciones (cuando vienen con include)
  Species?: Pokemon;
}
