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
}
