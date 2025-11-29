import { Pipe, PipeTransform } from '@angular/core';
import { Pokemon } from '../../core/models/pokemon.model';

@Pipe({
  name: 'pokemonFilter',
  standalone: true,
})
export class PokemonFilterPipe implements PipeTransform {
  transform(pokemons: Pokemon[] = [], search: string = ''): Pokemon[] {
    if (!pokemons.length || !search.trim()) return pokemons;

    const term = search.toLowerCase();

    return pokemons.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      p.types.some((t) => t.toLowerCase().includes(term))
    );
  }
}
