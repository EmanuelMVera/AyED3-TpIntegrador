
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

import { Pokemon } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  // backend de especies (tabla Pokemons)
  private apiUrl = 'http://localhost:4000/api/pokemons';

  private _allPokemons = new BehaviorSubject<Pokemon[]>([]);
  public readonly allPokemons$: Observable<Pokemon[]> =
    this._allPokemons.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Carga todas las especies desde el backend y actualiza el stream
   */
  getPokemons(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.apiUrl).pipe(
      tap((pokemons) => {
        this._allPokemons.next(pokemons);
      }),
      catchError((err: any) => {
        console.error('Error al obtener Pokemons del backend', err);
        this._allPokemons.next([]);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una especie concreta por id
   */
  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}/${id}`);
  }

  /**
   * Devuelve solo la descripción, sacada de la tabla Pokemons
   */
  getPokemonDescription(id: number): Observable<string> {
    return this.getPokemonById(id).pipe(
      map((p) => p.description || 'Sin descripción disponible.'),
      catchError((err: any) => {
        console.error('Error al cargar descripción del Pokémon', err);
        return of('Error al cargar la descripción.');
      })
    );
  }

  /**
   * ------- Compatibilidad con componentes actuales -------
   * addPokemon y deleteUserPokemon ahora trabajan contra el backend
   * para que crear-pokemon y pokedex sigan funcionando.
   */

  // Crear una especie nueva
  addPokemon(newPokemon: Omit<Pokemon, 'id'>): Observable<Pokemon[]> {
    return this.http.post<Pokemon>(this.apiUrl, newPokemon).pipe(
      switchMap(() => this.getPokemons()),
      catchError((err: any) => {
        console.error('Error al crear Pokémon', err);
        return this.getPokemons(); // devolvemos el estado actual igualmente
      })
    );
  }

  // El nombre original era deleteUserPokemon, lo dejo igual
  // pero ahora borra la especie en BD y recarga la lista.
  deleteUserPokemon(id: number): Observable<Pokemon[]> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      switchMap(() => this.getPokemons()),
      catchError((err: any) => {
        console.error('Error al eliminar Pokémon', err);
        return this.getPokemons();
      })
    );
  }

  /**
   * Tipos estáticos para formularios
   */
  getAllPokemonTypes(): string[] {
    return [
      'normal',
      'fire',
      'water',
      'grass',
      'electric',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'steel',
      'dark',
      'fairy',
    ];
  }
}
