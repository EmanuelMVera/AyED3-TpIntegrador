/*
 * Archivo: pokedex.component.ts
 * Descripción: Componente principal de la Pokédex. Gestiona la visualización
 * de la lista de Pokémon, incluyendo funcionalidades de búsqueda, paginación,
 * volteo de tarjetas para mostrar descripciones, y la gestión de Pokémon
 * creados por el usuario (eliminación). Interactúa con PokemonService
 * para la obtención y manipulación de datos.
 */

import { Component, OnInit, OnDestroy } from '@angular/core'; // Decorador Component y Hooks de ciclo de vida
import { PokemonService } from '../../core/services/pokemon.service'; // Servicio para obtener y gestionar datos de Pokémon
import { Pokemon } from '../../core/models/pokemon.model'; // Interfaz para el modelo de datos de Pokémon
import { CommonModule } from '@angular/common'; // Módulo con directivas comunes como *ngFor, *ngIf, etc.
import { FormsModule } from '@angular/forms'; // Módulo para el enlace bidireccional de formularios (ngModel)
import { Observable, Subject } from 'rxjs'; // Tipos de RxJS para manejo de flujos asíncronos y desuscripción
import { takeUntil } from 'rxjs/operators'; // Operador de RxJS para desuscribirse de observables al destruir el componente
import { POKEMON_TYPE_TRANSLATIONS } from '../../shared/constants/pokemon-types'; // Constante para traducciones de tipos de Pokémon

/**
 * @Component
 * @description Componente Angular para la vista de la Pokédex.
 * Implementa OnInit para la inicialización y OnDestroy para la limpieza de suscripciones.
 */
@Component({
  selector: 'app-pokedex', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que es un componente standalone (no requiere un NgModule)
  imports: [CommonModule, FormsModule], // Módulos que este componente necesita para su plantilla
  templateUrl: './pokedex.html', // Ruta al archivo de plantilla HTML de este componente
  styleUrl: './pokedex.css', // Ruta al archivo de estilos CSS de este componente
})
export class Pokedex implements OnInit, OnDestroy {
  /**
   * @property typeTranslations
   * @description Objeto que contiene las traducciones de los tipos de Pokémon.
   */
  typeTranslations = POKEMON_TYPE_TRANSLATIONS;

  /**
   * @property allPokemons
   * @description Array que almacena todos los Pokémon obtenidos del servicio.
   */
  allPokemons: Pokemon[] = [];

  /**
   * @property filteredPokemons
   * @description Array que almacena los Pokémon después de aplicar los filtros de búsqueda.
   */
  filteredPokemons: Pokemon[] = [];

  /**
   * @property paginatedPokemons
   * @description Array que almacena los Pokémon actualmente visibles en la página actual después de la paginación.
   */
  paginatedPokemons: Pokemon[] = [];

  /**
   * @property searchTerm
   * @description Término de búsqueda introducido por el usuario para filtrar Pokémon.
   */
  searchTerm: string = '';

  /**
   * @property currentPage
   * @description Número de la página actual en la paginación.
   */
  currentPage: number = 1;

  /**
   * @property itemsPerPage
   * @description Número de Pokémon a mostrar por página.
   */
  itemsPerPage: number = 12;

  /**
   * @property flippedCardId
   * @description Almacena el ID del Pokémon cuya tarjeta está actualmente volteada.
   * Si ninguna tarjeta está volteada, es `null`.
   */
  flippedCardId: number | null = null;

  /**
   * @property pokemonDescriptions
   * @description Objeto (mapa) que almacena en caché las descripciones de los Pokémon
   * ya cargadas, indexadas por su ID.
   */
  pokemonDescriptions: { [id: number]: string } = {};

  /**
   * @private
   * @property destroy$
   * @description Un Subject que emite un valor cuando el componente se va a destruir.
   * Utilizado para desuscribir automáticamente todos los observables y prevenir fugas de memoria.
   */
  private destroy$ = new Subject<void>();

  /**
   * @constructor
   * @param {PokemonService} pokemonService - Servicio inyectado para la gestión de datos de Pokémon.
   */
  constructor(private pokemonService: PokemonService) {}

  /**
   * @method ngOnInit
   * @description Hook del ciclo de vida de Angular. Se ejecuta una vez que el componente ha sido inicializado.
   * Se suscribe al observable `allPokemons$` del servicio para obtener la lista completa de Pokémon
   * y aplica el filtro y la paginación iniciales. También inicia la carga de Pokémon desde la API.
   */
  ngOnInit(): void {
    // Suscripción al flujo de todos los Pokémon del servicio.
    this.pokemonService.allPokemons$
      .pipe(takeUntil(this.destroy$)) // Asegura que la suscripción se desactive cuando el componente se destruya.
      .subscribe((pokemons) => {
        this.allPokemons = pokemons; // Actualiza la lista completa de Pokémon.
        this.applyFilterAndPagination(); // Aplica filtros y paginación con los nuevos datos.
      });

    // Inicia la carga de Pokémon desde el servicio. Esto dispara la primera emisión de allPokemons$.
    this.pokemonService.getPokemons().subscribe();
  }

  /**
   * @method ngOnDestroy
   * @description Hook del ciclo de vida de Angular. Se ejecuta justo antes de que el componente sea destruido.
   * Emite un valor a `destroy$` para desuscribir todos los observables suscritos con `takeUntil`,
   * previniendo fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emite un valor para notificar a los suscriptores.
    this.destroy$.complete(); // Completa el Subject para liberar recursos.
  }

  /**
   * @method onSearch
   * @description Manejador de eventos para la barra de búsqueda.
   * Reinicia la paginación a la primera página y aplica el filtro y la paginación nuevamente.
   */
  onSearch(): void {
    this.currentPage = 1; // Reinicia a la primera página con cada nueva búsqueda.
    this.applyFilterAndPagination(); // Aplica el filtro y actualiza la paginación.
  }

  /**
   * @method applyFilterAndPagination
   * @description Filtra la lista completa de Pokémon (`allPokemons`) basándose en el `searchTerm`
   * y luego aplica la paginación a la lista filtrada.
   */
  applyFilterAndPagination(): void {
    this.filteredPokemons = this.allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    ); // Filtra por nombre (insensible a mayúsculas/minúsculas).
    this.paginatePokemons(); // Aplica la paginación a la lista ya filtrada.
  }

  /**
   * @method paginatePokemons
   * @description Calcula los Pokémon a mostrar en la `currentPage` actual.
   * Actualiza el array `paginatedPokemons`.
   */
  paginatePokemons(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage; // Índice de inicio para el slice.
    const endIndex = startIndex + this.itemsPerPage; // Índice de fin para el slice.
    this.paginatedPokemons = this.filteredPokemons.slice(startIndex, endIndex); // Obtiene el subconjunto de Pokémon para la página actual.
  }

  /**
   * @method nextPage
   * @description Avanza a la siguiente página de Pokémon, si es posible.
   * Actualiza `currentPage` y vuelve a aplicar la paginación.
   */
  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredPokemons.length) {
      this.currentPage++; // Incrementa el número de página.
      this.paginatePokemons(); // Recalcula los Pokémon para la nueva página.
    }
  }

  /**
   * @method prevPage
   * @description Retrocede a la página anterior de Pokémon, si es posible.
   * Actualiza `currentPage` y vuelve a aplicar la paginación.
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa el número de página.
      this.paginatePokemons(); // Recalcula los Pokémon para la nueva página.
    }
  }

  /**
   * @method getTotalPages
   * @description Calcula y devuelve el número total de páginas necesarias
   * para mostrar todos los `filteredPokemons` con la cantidad de `itemsPerPage`.
   * @returns {number} El número total de páginas.
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredPokemons.length / this.itemsPerPage); // Redondea hacia arriba para asegurar que todos los Pokémon se muestren.
  }

  /**
   * @method flipCard
   * @description Voltea una tarjeta de Pokémon para mostrar su descripción.
   * Si la tarjeta ya está volteada, la devuelve a su estado original.
   * Carga la descripción del Pokémon de forma perezosa si aún no está disponible en caché.
   * @param {number} pokemonId - El ID del Pokémon cuya tarjeta se va a voltear.
   */
  flipCard(pokemonId: number): void {
    if (this.flippedCardId === pokemonId) {
      this.flippedCardId = null; // Si ya está volteada, la devuelve a la cara frontal.
    } else {
      this.flippedCardId = pokemonId; // Voltea la tarjeta a la cara trasera.
      // Carga la descripción solo si no está ya en caché.
      if (!this.pokemonDescriptions[pokemonId]) {
        this.pokemonService
          .getPokemonDescription(pokemonId)
          .subscribe((desc) => {
            this.pokemonDescriptions[pokemonId] = desc; // Almacena la descripción en caché.
          });
      }
    }
  }

  /**
   * @method getTranslatedType
   * @description Devuelve la traducción en español de un tipo de Pokémon.
   * Si no hay traducción disponible, devuelve el nombre del tipo original.
   * @param {string} type - El nombre del tipo de Pokémon (ej. 'grass', 'fire').
   * @returns {string} El nombre del tipo traducido (ej. 'Planta', 'Fuego').
   */
  getTranslatedType(type: string): string {
    return this.typeTranslations[type.toLowerCase()] || type; // Busca la traducción, o usa el tipo original si no se encuentra.
  }

  /**
   * @method getTypeClass
   * @description Genera el nombre de la clase CSS para un tipo de Pokémon.
   * Utilizado para aplicar estilos específicos de color o fondo según el tipo.
   * @param {string} type - El nombre del tipo de Pokémon.
   * @returns {string} El nombre de la clase CSS (ej. 'type-grass', 'type-fire').
   */
  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`; // Convierte el tipo a minúsculas para el nombre de la clase.
  }

  /**
   * @method deleteUserPokemon
   * @description Maneja la eliminación de un Pokémon creado por el usuario.
   * Muestra un cuadro de confirmación y, si se confirma, llama al servicio para eliminar el Pokémon.
   * @param {Event} event - El objeto de evento del clic. Se usa para detener la propagación.
   * @param {number} pokemonId - El ID del Pokémon a eliminar.
   */
  deleteUserPokemon(event: Event, pokemonId: number): void {
    event.stopPropagation(); // Detiene la propagación del evento para evitar que el clic voltee la tarjeta.
    if (confirm('¿Estás seguro de que quieres eliminar este Pokémon?')) {
      this.pokemonService.deleteUserPokemon(pokemonId).subscribe({
        next: () => {
          // No hay necesidad de un console.log aquí en producción.
          // El servicio ya actualiza allPokemons$ que a su vez refresca la vista.
        },
        error: (err) => {
          // No hay necesidad de un console.error aquí en producción.
          // Manejo de errores más robusto podría ser mostrar un mensaje al usuario.
        },
      });
    }
  }

  /**
   * @method trackByPokemonId
   * @description Función `trackBy` para la directiva `*ngFor`.
   * Mejora el rendimiento al ayudar a Angular a identificar unívocamente
   * los elementos de la lista por su ID.
   * @param {number} index - El índice del elemento en la lista.
   * @param {Pokemon} pokemon - El objeto Pokémon.
   * @returns {number} El ID único del Pokémon.
   */
  trackByPokemonId(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}