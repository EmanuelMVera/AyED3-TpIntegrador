import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../core/services/pokemon.service';
import { POKEMON_TYPE_TRANSLATIONS } from '../../shared/constants/pokemon-types';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
})
export class Pokedex implements OnInit {
  private pokemonService = inject(PokemonService);

  // Estado con Signals
  typeTranslations = POKEMON_TYPE_TRANSLATIONS;
  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = 12;
  flippedCardId = signal<number | null>(null);
  pokemonDescriptions = signal<Record<number, string>>({});

  // Pokémon filtrados (se recalculan solos cuando cambia el término de búsqueda o la lista del servicio)
  filteredPokemons = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.pokemonService.allPokemons(); // Consumimos la Signal del servicio
    return all.filter((p) => p.name.toLowerCase().includes(term));
  });

  // Pokémon paginados (dependen de los filtrados y la página actual)
  paginatedPokemons = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredPokemons().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredPokemons().length / this.itemsPerPage)
  );

  ngOnInit(): void {
    this.pokemonService.getPokemons().subscribe();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1); // Resetear a la primera página al buscar
  }

  changePage(delta: number): void {
    this.currentPage.update((prev) => prev + delta);
  }

  flipCard(pokemonId: number): void {
    if (this.flippedCardId() === pokemonId) {
      this.flippedCardId.set(null);
      return;
    }

    this.flippedCardId.set(pokemonId);

    // Solo pedimos la descripción si no la tenemos ya
    if (!this.pokemonDescriptions()[pokemonId]) {
      this.pokemonService.getPokemonDescription(pokemonId).subscribe((desc) => {
        this.pokemonDescriptions.update((dict) => ({
          ...dict,
          [pokemonId]: desc,
        }));
      });
    }
  }

  getTranslatedType(type: string): string {
    return this.typeTranslations[type.toLowerCase()] || type;
  }

  trackByPokemonId(_: number, pokemon: any): number {
    return pokemon.id;
  }
}
