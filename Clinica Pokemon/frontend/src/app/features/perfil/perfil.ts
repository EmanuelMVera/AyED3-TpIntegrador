import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { Pet } from '../../core/models/pet.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = signal<CurrentUser | null>(null);
  loading = signal(true);

  pets = signal<Pet[]>([]);
  petsLoading = signal(false);
  searchTerm = signal('');

  isStaff = computed(() => this.user()?.role === 'STAFF' || this.user()?.role === 'ADMIN');
  isOwner = computed(() => this.user()?.role === 'OWNER');

  filteredPets = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.pets();

    if (!term) return list;

    return list.filter((pet) => {
      const speciesName = pet.Species?.name?.toLowerCase() ?? '';
      const petName = pet.name?.toLowerCase() ?? '';
      const types = (pet.Species?.types ?? []).join(' ').toLowerCase();
      return petName.includes(term) || speciesName.includes(term) || types.includes(term);
    });
  });

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    this.http.get<CurrentUser>('http://localhost:4000/api/users/me').subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);

        if (data.role === 'OWNER') {
          this.loadMyPets();
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadMyPets(): void {
    this.petsLoading.set(true);
    this.http.get<Pet[]>('http://localhost:4000/api/pets/my').subscribe({
      next: (data) => {
        this.pets.set(data ?? []);
        this.petsLoading.set(false);
      },
      error: () => {
        this.pets.set([]);
        this.petsLoading.set(false);
      },
    });
  }

  downloadPDF(): void {
    // OWNER únicamente
    if (!this.isOwner()) return;

    this.http.get('http://localhost:4000/api/users/me/pdf', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const username = this.user()?.username ?? 'usuario';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfil_${username}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
