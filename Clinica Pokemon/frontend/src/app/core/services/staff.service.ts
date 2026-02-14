import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { User } from '../models/user.model';
import type { Pet } from '../models/pet.model';
import type { Pokemon } from '../models/pokemon.model';
import type {
  MedicalRecord,
  CreateMedicalRecordPayload,
  UpdateMedicalRecordPayload,
} from '../models/medical-record.model';

export interface CreatePetPayload {
  name: string;
  ownerId: number;
  speciesId: number;
  birthDate?: string | null;
  sex?: 'M' | 'F' | 'UNKNOWN';
  weightKg?: number | null;
  notes?: string | null;
  photoUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private http = inject(HttpClient);
  private api = 'http://localhost:4000/api';

  // Owners
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`);
  }

  // Species (catálogo)
  getSpecies(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(`${this.api}/pokemons`);
  }

  // Pets
  getAllPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.api}/pets`);
  }

  createPet(payload: CreatePetPayload): Observable<Pet> {
    return this.http.post<Pet>(`${this.api}/pets`, payload);
  }

  updatePet(
    id: number,
    payload: Partial<CreatePetPayload>,
  ): Observable<{ message: string; pet: Pet }> {
    return this.http.put<{ message: string; pet: Pet }>(
      `${this.api}/pets/${id}`,
      payload,
    );
  }

  deletePet(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/pets/${id}`);
  }

  // =========================
  // Medical Records
  // =========================

  // GET /api/records/pet/:petId
  getMedicalRecordsByPet(petId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.api}/records/pet/${petId}`);
  }

  // POST /api/records/pet/:petId
  createMedicalRecord(
    petId: number,
    payload: CreateMedicalRecordPayload,
  ): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(
      `${this.api}/records/pet/${petId}`,
      payload,
    );
  }

  // PUT /api/records/:id
  updateMedicalRecord(
    recordId: number,
    payload: UpdateMedicalRecordPayload,
  ): Observable<{ message: string; record: MedicalRecord }> {
    return this.http.put<{ message: string; record: MedicalRecord }>(
      `${this.api}/records/${recordId}`,
      payload,
    );
  }

  // DELETE /api/records/:id
  deleteMedicalRecord(recordId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.api}/records/${recordId}`,
    );
  }
}
