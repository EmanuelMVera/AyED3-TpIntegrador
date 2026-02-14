import type { Pet } from './pet.model';
import type { User } from './user.model';

export interface MedicalRecord {
  id: number;
  petId: number;
  vetId: number;

  date: string; // ISO datetime

  title: string;
  description: string;

  weightKg?: number | null;

  notesForOwner?: string | null;
  internalNotes?: string | null;

  visibleToOwner: boolean;

  createdAt?: string;
  updatedAt?: string;

  // Relaciones opcionales cuando el backend incluye asociaciones
  Pet?: Pet;
  Vet?: User;
}

/**
 * Payload para crear un informe clínico
 * POST /api/records/pet/:petId
 */
export interface CreateMedicalRecordPayload {
  title: string;
  description: string;
  weightKg?: number | null;
  notesForOwner?: string | null;
  internalNotes?: string | null;
  visibleToOwner?: boolean;
}

/**
 * Payload para actualizar un informe clínico
 * PUT /api/records/:id
 */
export interface UpdateMedicalRecordPayload {
  date?: string; // opcional si querés editar fecha
  title?: string;
  description?: string;
  weightKg?: number | null;
  notesForOwner?: string | null;
  internalNotes?: string | null;
  visibleToOwner?: boolean;
}
