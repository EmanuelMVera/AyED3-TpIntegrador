/*
 * Archivo: pokemon.service.ts
 * Descripción: Servicio central para la gestión de datos de Pokémon.
 * Encapsula la lógica para obtener Pokémon de la PokeAPI,
 * gestionar Pokémon creados por el usuario (persistencia en localStorage),
 * y proveer un flujo de datos unificado y reactivo de todos los Pokémon
 * disponibles en la aplicación.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';

import { Pokemon } from '../models/pokemon.model';
import {
  PokeApiPokemonDetail,
  PokeApiPokemonListResponse,
  PokeApiPokemonSpecies,
  PokeApiPokemonTypeEntry,
} from '../models/pokeapi-response.model';

/**
 * @Injectable
 * @description Servicio que proporciona acceso y gestión de datos de Pokémon.
 * Está disponible en la raíz de la aplicación, lo que significa que
 * es un singleton y puede ser inyectado en cualquier componente o servicio.
 */
@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  /**
   * @private
   * @property apiUrl
   * @description URL base para las peticiones a la PokeAPI.
   */
  private apiUrl = 'http://localhost:4000/api/pokemons/';

  /**
   * @private
   * @property apiPokemons
   * @description Almacena en caché los Pokémon obtenidos de la PokeAPI.
   */
  private apiPokemons: Pokemon[] = [];

  /**
   * @private
   * @property userPokemons
   * @description Almacena los Pokémon creados por el usuario.
   */
  private userPokemons: Pokemon[] = [];

  /**
   * @private
   * @property _allPokemons
   * @description `BehaviorSubject` que emite la lista combinada de Pokémon
   * (API + usuario). Permite que los componentes se suscriban a los cambios.
   */
  private _allPokemons = new BehaviorSubject<Pokemon[]>([]);

  /**
   * @public
   * @property allPokemons$
   * @description `Observable` público al que los componentes pueden suscribirse
   * para recibir la lista actualizada de todos los Pokémon. Es `readonly` para
   * prevenir modificaciones directas fuera de este servicio.
   */
  public readonly allPokemons$: Observable<Pokemon[]> =
    this._allPokemons.asObservable();

  /**
   * @private
   * @property isApiDataLoaded
   * @description Flag para indicar si los datos iniciales de la PokeAPI ya han sido cargados.
   */
  private isApiDataLoaded = false;

  /**
   * @constructor
   * @param {HttpClient} http - Cliente HTTP de Angular para realizar peticiones.
   */
  constructor(private http: HttpClient) {
    // Al inicializar el servicio, cargar los Pokémon guardados por el usuario desde localStorage.
    this.loadUserPokemons();
  }

  /**
   * @method getPokemons
   * @description Obtiene todos los Pokémon, combinando los de la PokeAPI
   * y los creados por el usuario. Realiza una única carga inicial de la API
   * y luego utiliza datos cacheados.
   * @returns {Observable<Pokemon[]>} Un Observable que emite la lista combinada de Pokémon.
   */
  getPokemons(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.apiUrl).pipe(
      tap((pokemons) => {
        this._allPokemons.next(pokemons);
      }),
      catchError((err) => {
        console.error('Error al obtener Pokemons del backend', err);
        return of([]);
      })
    );
  }

  /**
   * @method getPokemonDescription
   * @description Obtiene la descripción de un Pokémon por su ID.
   * Prioriza las descripciones de Pokémon creados por el usuario,
   * y si no están disponibles, las busca en la PokeAPI (en español).
   * @param {number} id - El ID del Pokémon.
   * @returns {Observable<string>} Un Observable que emite la descripción del Pokémon.
   */
  getPokemonDescription(id: number): Observable<string> {
    // Primero, intenta encontrar la descripción en los Pokémon creados por el usuario.
    const userPokemon = this.userPokemons.find((p) => p.id === id);
    if (userPokemon && userPokemon.description) {
      return of(userPokemon.description);
    }

    // Si no es un Pokémon creado por el usuario o no tiene descripción, busca en la API.
    return this.http
      .get<PokeApiPokemonSpecies>(`${this.apiUrl}pokemon-species/${id}/`)
      .pipe(
        map((species) => {
          // Busca la descripción en español.
          const spanishDescription = species.flavor_text_entries.find(
            (entry: any) => entry.language.name === 'es'
          );
          // Si se encuentra, la retorna limpiando los saltos de línea; de lo contrario, un mensaje por defecto.
          return spanishDescription
            ? spanishDescription.flavor_text.replace(/[\n\f]/g, ' ')
            : 'No description available.';
        }),
        catchError((error) => {
          return of('Error al cargar la descripción.'); // Mensaje de error para el usuario
        })
      );
  }

  // --- Métodos para la Gestión de Pokémon Creados por el Usuario ---

  /**
   * @private
   * @method loadUserPokemons
   * @description Carga los Pokémon creados por el usuario desde el `localStorage`.
   * Realiza un parseo seguro de la cadena JSON.
   */
  private loadUserPokemons(): void {
    const storedPokemons = localStorage.getItem('userPokemons');
    if (storedPokemons) {
      try {
        this.userPokemons = JSON.parse(storedPokemons);
      } catch (e) {
        this.userPokemons = []; // En caso de error, inicializa como un array vacío.
      }
    } else {
      this.userPokemons = []; // Si no hay datos en localStorage, inicializa como array vacío.
    }
  }

  /**
   * @private
   * @method saveUserPokemons
   * @description Guarda la lista actual de Pokémon creados por el usuario en el `localStorage`.
   */
  private saveUserPokemons(): void {
    localStorage.setItem('userPokemons', JSON.stringify(this.userPokemons));
  }

  /**
   * @method addPokemon
   * @description Añade un nuevo Pokémon creado por el usuario a la lista.
   * Genera un ID único (negativo para evitar colisiones con IDs de la API)
   * y guarda la lista actualizada en `localStorage`.
   * @param {Omit<Pokemon, 'id'>} newPokemon - El objeto Pokémon a añadir, sin el ID.
   * @returns {Observable<Pokemon[]>} Un Observable que emite la lista combinada de Pokémon actualizada.
   */
  addPokemon(newPokemon: Omit<Pokemon, 'id'>): Observable<Pokemon[]> {
    return this.http
      .post<Pokemon>(this.apiUrl, newPokemon)
      .pipe(switchMap(() => this.getPokemons()));
  }

  /**
   * @method deleteUserPokemon
   * @description Elimina un Pokémon creado por el usuario de la lista.
   * Guarda la lista actualizada en `localStorage` y emite los cambios.
   * @param {number} id - El ID del Pokémon a eliminar (debe ser un ID de usuario, es decir, negativo).
   * @returns {Observable<Pokemon[]>} Un Observable que emite la lista combinada de Pokémon actualizada.
   */
  deleteUserPokemon(id: number): Observable<Pokemon[]> {
    const initialLength = this.userPokemons.length;
    this.userPokemons = this.userPokemons.filter((p) => p.id !== id); // Filtra para eliminar el Pokémon por ID

    if (this.userPokemons.length < initialLength) {
      this.saveUserPokemons(); // Guarda la lista actualizada si hubo cambios
      // Emite la nueva lista combinada de Pokémon.
      this._allPokemons.next([...this.userPokemons, ...this.apiPokemons]);
      return this.allPokemons$;
    } else {
      // Si el Pokémon no fue encontrado para eliminar.
      return this.allPokemons$; // Devuelve el estado actual sin cambios
    }
  }

  /**
   * @method getAllPokemonTypes
   * @description Provee una lista estática de todos los tipos de Pokémon disponibles.
   * Útil para formularios (ej. el formulario de creación de Pokémon) o filtros.
   * @returns {string[]} Un array de strings con los nombres de los tipos de Pokémon.
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
