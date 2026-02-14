import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { StaffService } from '../../core/services/staff.service';
import { AuthService } from '../../core/services/auth.service';

import type { User } from '../../core/models/user.model';
import type { Pet } from '../../core/models/pet.model';
import type { Pokemon } from '../../core/models/pokemon.model';
import type { MedicalRecord } from '../../core/models/medical-record.model';

type PetFormState = {
  id: number | null;
  name: string;
  ownerId: number | null;
  speciesId: number | null;
  birthDate: string;
  sex: 'M' | 'F' | 'UNKNOWN';
  weightKg: number | null;
  notes: string;
  photoUrl: string;
};

type RecordFormState = {
  title: string;
  description: string;
  weightKg: number | null;
  notesForOwner: string;
  internalNotes: string;
  visibleToOwner: boolean;
};

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-dashboard.html',
  styleUrl: './staff-dashboard.css',
})
export class StaffDashboard {
  private staffService = inject(StaffService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // =========================
  // Estado general
  // =========================
  loading = signal(true);
  savingPet = signal(false);
  error = signal('');
  success = signal('');

  owners = signal<User[]>([]);
  allPets = signal<Pet[]>([]);
  species = signal<Pokemon[]>([]);

  searchOwner = signal('');
  selectedOwnerId = signal<number | null>(null);

  // =========================
  // Toast + modal delete
  // =========================
  deleteModalOpen = signal(false);
  petToDelete = signal<Pet | null>(null);

  toast = signal<{ open: boolean; message: string; type: 'success' | 'error' }>(
    {
      open: false,
      message: '',
      type: 'success',
    },
  );
  private toastTimer: number | null = null;

  // =========================
  // Form mascota
  // =========================
  petForm = signal<PetFormState>({
    id: null,
    name: '',
    ownerId: null,
    speciesId: null,
    birthDate: '',
    sex: 'UNKNOWN',
    weightKg: null,
    notes: '',
    photoUrl: '',
  });

  // =========================
  // Historial médico (modal)
  // =========================
  historyModalOpen = signal(false);
  selectedPetForRecord = signal<Pet | null>(null);
  recordsLoading = signal(false);
  recordsOfSelectedPet = signal<MedicalRecord[]>([]);
  savingRecord = signal(false);

  recordForm = signal<RecordFormState>({
    title: '',
    description: '',
    weightKg: null,
    notesForOwner: '',
    internalNotes: '',
    visibleToOwner: true,
  });

  // =========================
  // Computeds
  // =========================
  filteredOwners = computed(() => {
    const term = this.searchOwner().trim().toLowerCase();
    const owners = this.owners().filter((u) => u.role === 'OWNER');
    if (!term) return owners;

    return owners.filter(
      (o) =>
        o.username.toLowerCase().includes(term) ||
        o.email.toLowerCase().includes(term) ||
        `${o.firstName ?? ''} ${o.lastName ?? ''}`.toLowerCase().includes(term),
    );
  });

  selectedOwner = computed(
    () => this.owners().find((u) => u.id === this.selectedOwnerId()) ?? null,
  );

  petsOfSelectedOwner = computed(() => {
    const ownerId = this.selectedOwnerId();
    if (!ownerId) return [];
    return this.allPets()
      .filter((p) => p.ownerId === ownerId)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    if (!this.authService.isStaff()) {
      this.router.navigate(['/inicio']);
      return;
    }
    this.loadAll();
  }

  // =========================
  // Helpers UI
  // =========================
  private clearMessages(): void {
    this.error.set('');
    this.success.set('');
  }

  private showToast(
    message: string,
    type: 'success' | 'error' = 'success',
  ): void {
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.toast.set({ open: true, message, type });

    this.toastTimer = window.setTimeout(() => {
      this.toast.set({ open: false, message: '', type: 'success' });
    }, 2800);
  }

  formatSex(sex: 'M' | 'F' | 'UNKNOWN' | string | null | undefined): string {
    if (sex === 'M') return 'Macho';
    if (sex === 'F') return 'Hembra';
    return 'Desconocido';
  }

  // =========================
  // Carga inicial
  // =========================
  loadAll(): void {
    this.loading.set(true);
    this.clearMessages();

    this.staffService.getUsers().subscribe({
      next: (users: User[]) => {
        this.owners.set(users);

        if (!this.selectedOwnerId()) {
          const firstOwner = users.find((u) => u.role === 'OWNER');
          this.selectedOwnerId.set(firstOwner?.id ?? null);
        }

        this.staffService.getAllPets().subscribe({
          next: (pets: Pet[]) => {
            this.allPets.set(pets);

            this.staffService.getSpecies().subscribe({
              next: (species: Pokemon[]) => {
                this.species.set(species);
                this.loading.set(false);
              },
              error: (err: HttpErrorResponse) => {
                console.error(err);
                this.error.set('No se pudieron cargar las especies.');
                this.loading.set(false);
              },
            });
          },
          error: (err: HttpErrorResponse) => {
            console.error(err);
            this.error.set('No se pudieron cargar las mascotas.');
            this.loading.set(false);
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set('No se pudieron cargar los clientes.');
        this.loading.set(false);
      },
    });
  }

  // =========================
  // Owners / selección
  // =========================
  selectOwner(ownerId: number): void {
    this.selectedOwnerId.set(ownerId);
    this.clearMessages();
    this.resetPetForm();
    this.petForm.update((f) => ({ ...f, ownerId }));
  }

  startCreatePet(): void {
    const ownerId = this.selectedOwnerId();
    this.clearMessages();
    this.resetPetForm();
    this.petForm.update((f) => ({ ...f, ownerId }));
  }

  // =========================
  // Form mascota (edit/create)
  // =========================
  startEditPet(pet: Pet): void {
    this.petForm.set({
      id: pet.id,
      name: pet.name,
      ownerId: pet.ownerId,
      speciesId: pet.speciesId,
      birthDate: pet.birthDate ?? '',
      sex: pet.sex ?? 'UNKNOWN',
      weightKg: pet.weightKg ?? null,
      notes: pet.notes ?? '',
      photoUrl: pet.photoUrl ?? '',
    });
    this.clearMessages();
  }

  onPetNameChange(value: string): void {
    this.petForm.update((f) => ({ ...f, name: value }));
  }

  onSpeciesChange(value: string | number | null): void {
    const speciesId = value === null || value === '' ? null : Number(value);
    this.petForm.update((f) => ({
      ...f,
      speciesId: Number.isNaN(speciesId as number) ? null : speciesId,
    }));
  }

  onBirthDateChange(value: string): void {
    this.petForm.update((f) => ({ ...f, birthDate: value }));
  }

  onSexChange(value: 'M' | 'F' | 'UNKNOWN' | string): void {
    const sex: 'M' | 'F' | 'UNKNOWN' =
      value === 'M' || value === 'F' ? value : 'UNKNOWN';
    this.petForm.update((f) => ({ ...f, sex }));
  }

  onWeightChange(value: string | number | null): void {
    const weightKg = value === '' || value === null ? null : Number(value);
    this.petForm.update((f) => ({
      ...f,
      weightKg: Number.isNaN(weightKg as number) ? null : weightKg,
    }));
  }

  onNotesChange(value: string): void {
    this.petForm.update((f) => ({ ...f, notes: value }));
  }

  savePet(): void {
    const f = this.petForm();

    if (!f.name || !f.ownerId || !f.speciesId) {
      this.error.set('Nombre, dueño y especie son obligatorios.');
      return;
    }

    this.savingPet.set(true);
    this.clearMessages();

    const payload = {
      name: f.name.trim(),
      ownerId: f.ownerId,
      speciesId: f.speciesId,
      birthDate: f.birthDate || null,
      sex: f.sex,
      weightKg: f.weightKg ?? null,
      notes: f.notes?.trim() || null,
      photoUrl: f.photoUrl?.trim() || null,
    };

    if (f.id) {
      this.staffService.updatePet(f.id, payload).subscribe({
        next: () => {
          this.success.set('Mascota actualizada correctamente.');
          this.showToast('Edición exitosa', 'success');
          this.savingPet.set(false);
          this.loadPetsOnly();
          this.resetPetForm();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.error.set(
            err?.error?.error || 'No se pudo actualizar la mascota.',
          );
          this.showToast(this.error(), 'error');
          this.savingPet.set(false);
        },
      });
      return;
    }

    this.staffService.createPet(payload).subscribe({
      next: () => {
        this.success.set('Mascota creada correctamente.');
        this.showToast('Registro exitoso', 'success');
        this.savingPet.set(false);
        this.loadPetsOnly();
        this.resetPetForm();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set(err?.error?.error || 'No se pudo crear la mascota.');
        this.showToast(this.error(), 'error');
        this.savingPet.set(false);
      },
    });
  }

  private loadPetsOnly(): void {
    this.staffService.getAllPets().subscribe({
      next: (pets: Pet[]) => this.allPets.set(pets),
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set('No se pudieron refrescar las mascotas.');
      },
    });
  }

  resetPetForm(): void {
    this.petForm.set({
      id: null,
      name: '',
      ownerId: this.selectedOwnerId(),
      speciesId: null,
      birthDate: '',
      sex: 'UNKNOWN',
      weightKg: null,
      notes: '',
      photoUrl: '',
    });
  }

  getSpeciesName(speciesId: number): string {
    return (
      this.species().find((s) => s.id === speciesId)?.name ?? `#${speciesId}`
    );
  }

  // =========================
  // Eliminar mascota (modal)
  // =========================
  deletePet(pet: Pet): void {
    this.petToDelete.set(pet);
    this.deleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.petToDelete.set(null);
  }

  confirmDelete(): void {
    const pet = this.petToDelete();
    if (!pet) return;

    this.deleteModalOpen.set(false);

    this.staffService.deletePet(pet.id).subscribe({
      next: () => {
        this.success.set('Mascota eliminada correctamente.');
        this.showToast('Mascota eliminada', 'success');
        this.loadPetsOnly();
        this.petToDelete.set(null);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        const msg = err?.error?.error || 'No se pudo eliminar la mascota.';
        this.error.set(msg);
        this.showToast(msg, 'error');
        this.petToDelete.set(null);
      },
    });
  }

  // =========================
  // Historial médico
  // =========================
  openMedicalHistory(pet: Pet): void {
    this.selectedPetForRecord.set(pet);
    this.historyModalOpen.set(true);
    this.resetRecordForm();
    this.loadRecordsByPet(pet.id);
  }

  closeMedicalHistory(): void {
    this.historyModalOpen.set(false);
    this.selectedPetForRecord.set(null);
    this.recordsOfSelectedPet.set([]);
    this.resetRecordForm();
  }

  private loadRecordsByPet(petId: number): void {
    this.recordsLoading.set(true);

    this.staffService.getMedicalRecordsByPet(petId).subscribe({
      next: (records: MedicalRecord[]) => {
        this.recordsOfSelectedPet.set(records ?? []);
        this.recordsLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.recordsLoading.set(false);
        this.showToast('No se pudo cargar el historial médico', 'error');
      },
    });
  }

  onRecordTitleChange(value: string): void {
    this.recordForm.update((f) => ({ ...f, title: value }));
  }

  onRecordDescriptionChange(value: string): void {
    this.recordForm.update((f) => ({ ...f, description: value }));
  }

  onRecordWeightChange(value: string | number | null): void {
    const weightKg = value === '' || value === null ? null : Number(value);
    this.recordForm.update((f) => ({
      ...f,
      weightKg: Number.isNaN(weightKg as number) ? null : weightKg,
    }));
  }

  onRecordNotesForOwnerChange(value: string): void {
    this.recordForm.update((f) => ({ ...f, notesForOwner: value }));
  }

  onRecordInternalNotesChange(value: string): void {
    this.recordForm.update((f) => ({ ...f, internalNotes: value }));
  }

  onRecordVisibleChange(value: boolean): void {
    this.recordForm.update((f) => ({ ...f, visibleToOwner: !!value }));
  }

  saveRecord(): void {
    const pet = this.selectedPetForRecord();
    const f = this.recordForm();

    if (!pet) return;

    if (!f.title.trim() || !f.description.trim()) {
      this.showToast('Título y descripción son obligatorios', 'error');
      return;
    }

    this.savingRecord.set(true);

    this.staffService
      .createMedicalRecord(pet.id, {
        title: f.title.trim(),
        description: f.description.trim(),
        weightKg: f.weightKg ?? null,
        notesForOwner: f.notesForOwner?.trim() || null,
        internalNotes: f.internalNotes?.trim() || null,
        visibleToOwner: !!f.visibleToOwner,
      })
      .subscribe({
        next: () => {
          this.savingRecord.set(false);
          this.showToast('Informe clínico creado', 'success');
          this.resetRecordForm();
          this.loadRecordsByPet(pet.id);
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.savingRecord.set(false);
          this.showToast(
            err?.error?.error || 'No se pudo crear el informe',
            'error',
          );
        },
      });
  }

  resetRecordForm(): void {
    this.recordForm.set({
      title: '',
      description: '',
      weightKg: null,
      notesForOwner: '',
      internalNotes: '',
      visibleToOwner: true,
    });
  }
}
