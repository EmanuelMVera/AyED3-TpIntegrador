/*
 * Archivo: crear-pokemon.component.ts
 * Descripción: Componente para la creación de nuevos Pokémon personalizados.
 * Gestiona un formulario reactivo con validaciones, la selección
 * de tipos y la carga de imágenes de vista previa.
 * Interactúa con PokemonService para añadir el nuevo Pokémon.
 */

import { Component, OnInit } from '@angular/core'; // Decorador Component y Hook de ciclo de vida OnInit
import { CommonModule } from '@angular/common'; // Módulo con directivas comunes como *ngIf, *ngFor
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms'; // Módulos y clases para trabajar con Formularios Reactivos
import { PokemonService } from '../../core/services/pokemon.service'; // Servicio para interactuar con los datos de Pokémon
import { Pokemon } from '../../core/models/pokemon.model'; // Interfaz para el modelo de datos de un Pokémon
import { filter } from 'rxjs/operators'; // Operador de RxJS para filtrar valores de observables
import { POKEMON_TYPE_TRANSLATIONS } from '../../shared/constants/pokemon-types'; // Constante para las traducciones de tipos de Pokémon

/**
 * @Component
 * @description Componente Angular para la interfaz de creación de Pokémon.
 * Utiliza formularios reactivos para la entrada de datos y validación.
 * Implementa OnInit para la inicialización.
 */
@Component({
  selector: 'app-crear-pokemon', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que es un componente standalone (no requiere un NgModule)
  imports: [CommonModule, ReactiveFormsModule], // Módulos que este componente necesita para su plantilla
  templateUrl: './crear-pokemon.html', // Ruta al archivo de plantilla HTML de este componente
  styleUrl: './crear-pokemon.css' // Ruta al archivo de estilos CSS de este componente
})
export class CrearPokemon implements OnInit {
  /**
   * @property typeTranslations
   * @description Objeto que contiene las traducciones de los nombres de los tipos de Pokémon.
   * Utilizado para mostrar los tipos en español en la UI.
   */
  typeTranslations = POKEMON_TYPE_TRANSLATIONS;

  /**
   * @property pokemonForm
   * @description Instancia de FormGroup que representa el formulario de creación de Pokémon.
   * Contiene los FormControl para cada campo de entrada y sus validadores.
   */
  pokemonForm!: FormGroup; // `!` indica que será inicializada en `ngOnInit`

  /**
   * @property allPokemonTypes
   * @description Array de cadenas que contiene todos los tipos de Pokémon disponibles
   * para la selección del usuario.
   */
  allPokemonTypes: string[] = [];

  /**
   * @property previewImageUrl
   * @description Almacena la URL de la imagen que el usuario ha introducido para previsualizarla.
   * Es `null` si no hay URL válida o si ha habido un error al cargar la imagen.
   */
  previewImageUrl: string | null = null;

  /**
   * @property showSuccessMessage
   * @description Bandera booleana que controla la visibilidad del mensaje de éxito
   * después de que un Pokémon ha sido creado satisfactoriamente.
   */
  showSuccessMessage: boolean = false;

  /**
   * @constructor
   * @param {FormBuilder} fb - Servicio inyectado de FormBuilder para construir el formulario reactivo.
   * @param {PokemonService} pokemonService - Servicio inyectado para la lógica de negocio relacionada con Pokémon.
   */
  constructor(
    private fb: FormBuilder,
    private pokemonService: PokemonService
  ) {}

  /**
   * @method ngOnInit
   * @description Hook del ciclo de vida de Angular. Se ejecuta una vez que el componente ha sido inicializado.
   * Inicializa la lista de todos los tipos de Pokémon, configura el formulario reactivo
   * y se suscribe a los cambios del campo `imageUrl` para la vista previa de la imagen.
   */
  ngOnInit(): void {
    // Obtiene todos los tipos de Pokémon disponibles del servicio.
    this.allPokemonTypes = this.pokemonService.getAllPokemonTypes();
    // Inicializa la estructura y validadores del formulario.
    this.initForm();

    // Suscripción a los cambios del valor del campo 'imageUrl' para la vista previa.
    this.pokemonForm.get('imageUrl')?.valueChanges.pipe(
      // Filtra solo las URLs que son cadenas y no están vacías.
      filter(url => typeof url === 'string' && url.length > 0)
    ).subscribe(url => {
      // Actualiza la URL de la vista previa con el valor del campo.
      this.previewImageUrl = url;
    });

    // Suscripción a los cambios de estado del campo 'imageUrl' (por ejemplo, 'INVALID').
    this.pokemonForm.get('imageUrl')?.statusChanges.subscribe(status => {
      // Si el campo es inválido o está vacío, resetea la vista previa a null.
      if (status === 'INVALID' || this.pokemonForm.get('imageUrl')?.value === '') {
        this.previewImageUrl = null;
      }
    });
  }

  /**
   * @method initForm
   * @description Inicializa el `FormGroup` `pokemonForm` con sus `FormControl`
   * y los validadores correspondientes para cada campo.
   */
  initForm(): void {
    this.pokemonForm = this.fb.group({
      // Campo 'name' con validadores de requerido, longitud mínima, longitud máxima y patrón.
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9\s-]+$/) // Permite letras, números, espacios y guiones
      ]],
      // Campo 'types' (un array de strings) con validadores personalizados
      // para un mínimo y máximo de tipos seleccionados.
      types: [[], [
        Validators.required, // Este validator es un "placeholder" para el error de requerido
        this.minSelectedCheckboxes(1), // Validador personalizado: al menos 1 tipo
        this.maxSelectedCheckboxes(2)  // Validador personalizado: máximo 2 tipos
      ]],
      // Campo 'description' con validadores de requerido, longitud mínima y máxima.
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      // Campo 'imageUrl' con validadores de requerido y patrón para formato de URL de imagen.
      imageUrl: ['', [
        Validators.required,
        Validators.pattern(/^(http(s?):\/\/(.)*\.(jpg|jpeg|png|gif|webp)(\/.*)?)$/i) // Patrón para URLs de imágenes
      ]]
    });
  }

  /**
   * @method minSelectedCheckboxes
   * @description Validador personalizado para asegurar que al menos un número mínimo de checkboxes
   * (o elementos en un array) estén seleccionados.
   * @param {number} min - El número mínimo de elementos que deben estar seleccionados.
   * @returns {ValidatorFn} - Una función validadora de Angular Reactive Forms.
   */
  minSelectedCheckboxes(min: number) {
    return (control: FormControl) => {
      // Obtiene la longitud del array de valores del control.
      const selectedCount = control.value ? control.value.length : 0;
      // Retorna `null` si el conteo es mayor o igual al mínimo (válido),
      // de lo contrario, retorna un objeto de error.
      return selectedCount >= min ? null : { minSelectedCheckboxes: { required: min, actual: selectedCount } };
    };
  }

  /**
   * @method maxSelectedCheckboxes
   * @description Validador personalizado para asegurar que no se exceda un número máximo de checkboxes
   * (o elementos en un array) seleccionados.
   * @param {number} max - El número máximo de elementos que pueden estar seleccionados.
   * @returns {ValidatorFn} - Una función validadora de Angular Reactive Forms.
   */
  maxSelectedCheckboxes(max: number) {
    return (control: FormControl) => {
      // Obtiene la longitud del array de valores del control.
      const selectedCount = control.value ? control.value.length : 0;
      // Retorna `null` si el conteo es menor o igual al máximo (válido),
      // de lo contrario, retorna un objeto de error.
      return selectedCount <= max ? null : { maxSelectedCheckboxes: { required: max, actual: selectedCount } };
    };
  }

  /**
   * @method onTypeChange
   * @description Maneja la lógica de selección y deselección de tipos de Pokémon.
   * Permite al usuario seleccionar hasta 2 tipos y gestiona la adición/eliminación de tipos
   * del `FormControl` 'types'.
   * @param {string} type - El tipo de Pokémon que se está seleccionando/deseleccionando.
   */
  onTypeChange(type: string): void {
    // Obtiene el array actual de tipos seleccionados.
    const currentTypes = this.pokemonForm.get('types')?.value as string[];
    // Busca el índice del tipo en el array actual.
    const typeIndex = currentTypes.indexOf(type);

    if (typeIndex > -1) {
      // Si el tipo ya está seleccionado (índice encontrado), lo deselecciona (lo filtra del array).
      this.pokemonForm.get('types')?.setValue(currentTypes.filter(t => t !== type));
    } else {
      // Si el tipo no está seleccionado y el número de tipos actuales es menor que el límite (2).
      if (currentTypes.length < 2) {
        // Añade el nuevo tipo al array de tipos seleccionados.
        this.pokemonForm.get('types')?.setValue([...currentTypes, type]);
      }
      // Si el límite ya se alcanzó, no se hace nada (el botón estará deshabilitado de todos modos).
    }
    // Marca el control 'types' como "dirty" (modificado) y fuerza una revalidación,
    // lo que permite que los mensajes de error personalizados se muestren/oculten.
    this.pokemonForm.get('types')?.markAsDirty();
    this.pokemonForm.get('types')?.updateValueAndValidity();
  }

  /**
   * @method isTypeSelected
   * @description Verifica si un tipo de Pokémon dado está actualmente seleccionado en el formulario.
   * @param {string} type - El tipo de Pokémon a verificar.
   * @returns {boolean} - `true` si el tipo está seleccionado, `false` en caso contrario.
   */
  isTypeSelected(type: string): boolean {
    // Comprueba si el array de tipos seleccionados incluye el tipo dado.
    // Proporciona un array vacío `[]` como fallback si el valor es nulo o indefinido.
    return (this.pokemonForm.get('types')?.value as string[] || []).includes(type);
  }

  /**
   * @method areMaxTypesSelected
   * @description Verifica si el número máximo de tipos de Pokémon (2) ya ha sido seleccionado.
   * @returns {boolean} - `true` si ya se han seleccionado 2 tipos, `false` en caso contrario.
   */
  areMaxTypesSelected(): boolean {
    // Comprueba si la longitud del array de tipos seleccionados es igual o mayor a 2.
    return (this.pokemonForm.get('types')?.value as string[] || []).length >= 2;
  }

  /**
   * @method getTranslatedType
   * @description Devuelve la traducción en español de un tipo de Pokémon.
   * @param {string} type - El nombre del tipo de Pokémon en inglés.
   * @returns {string} - El nombre del tipo traducido, o el original si no se encuentra traducción.
   */
  getTranslatedType(type: string): string {
    return this.typeTranslations[type.toLowerCase()] || type;
  }

  /**
   * @method onSubmit
   * @description Maneja el envío del formulario de creación de Pokémon.
   * Si el formulario es válido, construye un nuevo objeto Pokémon y lo añade a través del servicio.
   * Luego, resetea el formulario y muestra un mensaje de éxito temporal.
   */
  onSubmit(): void {
    if (this.pokemonForm.valid) {
      // Extrae los datos del formulario, excluyendo la propiedad 'id' ya que será generada en el backend.
      const newPokemonData: Omit<Pokemon, 'id'> = this.pokemonForm.value;
      // Normaliza el nombre del Pokémon a minúsculas antes de enviarlo.
      newPokemonData.name = newPokemonData.name.toLowerCase();

      // Llama al servicio para añadir el nuevo Pokémon.
      this.pokemonService.addPokemon(newPokemonData).subscribe({
        next: () => {
          // console.log('Pokémon creado con éxito:', newPokemonData); // Eliminar en producción
          this.showSuccessMessage = true; // Muestra el mensaje de éxito
          this.pokemonForm.reset(); // Resetea todos los campos del formulario
          this.pokemonForm.get('types')?.setValue([]); // Reinicia explícitamente el campo de tipos (reset() no lo hace para arrays)
          this.previewImageUrl = null; // Borra la imagen de vista previa
          // Oculta el mensaje de éxito después de 3 segundos.
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (err) => {
          // console.error('Error al crear Pokémon:', err); // Eliminar en producción
          // Aquí se podría añadir lógica para mostrar un mensaje de error al usuario
        }
      });
    } else {
      // console.log('Formulario inválido. Revise los campos.'); // Eliminar en producción
      // Si el formulario es inválido, marca todos los controles como 'touched'
      // para forzar la visualización de todos los mensajes de error.
      this.markAllFormControlsAsTouched(this.pokemonForm);
    }
  }

  /**
   * @private
   * @method markAllFormControlsAsTouched
   * @description Función auxiliar recursiva que marca todos los `FormControl`
   * dentro de un `FormGroup` (o un `FormControl` individual) como `touched`.
   * Esto es útil para mostrar los mensajes de validación cuando el usuario
   * intenta enviar un formulario inválido sin haber interactuado con todos los campos.
   * @param {FormGroup | FormControl} formGroup - El `FormGroup` o `FormControl` a marcar.
   */
  private markAllFormControlsAsTouched(formGroup: FormGroup | FormControl) {
    if (formGroup instanceof FormControl) {
      formGroup.markAsTouched(); // Marca el control individual como touched
    } else {
      // Itera sobre todos los controles dentro del FormGroup.
      Object.values(formGroup.controls).forEach(control => {
        if (control instanceof FormControl) {
          control.markAsTouched(); // Si es un FormControl, lo marca
        } else if (control instanceof FormGroup) {
          // Si es otro FormGroup anidado, llama a la función recursivamente.
          this.markAllFormControlsAsTouched(control);
        }
      });
    }
  }

  /**
   * @method onClear
   * @description Resetea el formulario a su estado inicial, limpia la selección de tipos,
   * la vista previa de la imagen y oculta el mensaje de éxito.
   */
  onClear(): void {
    this.pokemonForm.reset(); // Resetea el formulario (valores a sus valores iniciales/vacíos)
    this.pokemonForm.get('types')?.setValue([]); // Asegura que el array de tipos se vacíe
    this.previewImageUrl = null; // Limpia la vista previa de la imagen
    this.showSuccessMessage = false; // Oculta el mensaje de éxito
  }

  /**
   * @method trackByType
   * @description Función `trackBy` para la directiva `*ngFor` en la lista de tipos.
   * Mejora el rendimiento de renderizado al permitir que Angular identifique unívocamente
   * los elementos de la lista por su valor de tipo.
   * @param {number} index - El índice del elemento en la lista.
   * @param {string} type - El valor del tipo de Pokémon.
   * @returns {string} - El tipo de Pokémon (como identificador único).
   */
  trackByType(index: number, type: string): string {
    return type;
  }
}