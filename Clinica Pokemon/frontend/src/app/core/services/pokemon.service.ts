import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { Pokemon, PokemonType } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/pokemons';

  // Estado privado con Signal
  private _allPokemons = signal<Pokemon[]>([]);
  
  // Exposición pública del estado (Solo lectura)
  public allPokemons = this._allPokemons.asReadonly();

  /**
   * Carga especies y actualiza la Signal automáticamente
   */
  getPokemons(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.apiUrl).pipe(
      tap(pokemons => this._allPokemons.set(pokemons)),
      catchError(err => {
        console.error('Error al obtener Pokemons', err);
        return of([]);
      })
    );
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}/${id}`);
  }

  getPokemonDescription(id: number): Observable<string> {
    return this.getPokemonById(id).pipe(
      map(p => p.description || 'Sin descripción disponible.'),
      catchError(() => of('Error al cargar la descripción.'))
    );
  }

  addPokemon(newPokemon: Omit<Pokemon, 'id'>): Observable<Pokemon[]> {
    return this.http.post<Pokemon>(this.apiUrl, newPokemon).pipe(
      switchMap(() => this.getPokemons())
    );
  }

  deleteUserPokemon(id: number): Observable<Pokemon[]> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      switchMap(() => this.getPokemons())
    );
  }

  /**
   * Tipos estáticos usando el Type Alias que definimos en el modelo
   */
  getAllPokemonTypes(): PokemonType[] {
    return [
      'normal', 'fire', 'water', 'grass', 'electric', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic',
      'bug', 'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
    ];
  }
}