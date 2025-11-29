import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { PokemonFilterPipe } from '../../core/pipes/pokemon-filter.pipe';

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  description: string;
    editing?: boolean;       
  typesString?: string; 
}

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  Pokemons?: Pokemon[];
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PokemonFilterPipe],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  user: User | null = null;
  error = '';
  loading = true;
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  /** Obtiene los datos del usuario logueado */
  getUserData(): void {
    this.http.get<User>('http://localhost:4000/api/users/me').subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.error = 'No se pudieron cargar tus datos.';
        this.loading = false;
      },
    });
  }

  /** Cierra sesión y redirige */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  editPokemon(pokemon: any) {
    this.router.navigate(['/crear-pokemon'], { state: { pokemon } });
  }

  deletePokemon(id: number) {
    if (confirm('¿Eliminar este Pokémon?')) {
      this.http.delete(`http://localhost:4000/api/pokemons/${id}`).subscribe({
        next: () => {
          if (this.user) {
            this.user.Pokemons = this.user.Pokemons?.filter((p) => p.id !== id);
          }
        },
        error: (err) => console.error('Error al eliminar:', err),
      });
    }
  }

  downloadPDF() {
    const token = this.authService.getToken(); // obtener token del localStorage

    this.http
      .get('http://localhost:4000/api/users/me/pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // importante: recibimos el PDF como blob
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'perfil_pokemon.pdf';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error al descargar PDF:', err);
          alert('No se pudo generar el PDF.');
        },
      });
  }
  startEdit(pokemon: any) {
    pokemon.editing = true;
    pokemon.typesString = pokemon.types.join(', ');
  }

  cancelEdit(pokemon: any) {
    pokemon.editing = false;
  }

  saveEdit(pokemon: any) {
    const updated = {
      name: pokemon.name,
      description: pokemon.description,
      types: pokemon.typesString.split(',').map((t: string) => t.trim()),
    };

    this.http
      .put(`http://localhost:4000/api/pokemons/${pokemon.id}`, updated)
      .subscribe({
        next: () => {
          pokemon.editing = false;
          alert('Pokémon actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar Pokémon:', err);
          alert('Error al guardar los cambios.');
        },
      });
  }
}
