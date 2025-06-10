/*
 * Archivo: header.component.ts
 * Descripción: Define el comportamiento y la lógica para el componente <app-header>.
 * Este componente gestiona el estado del menú de navegación,
 * permitiendo su apertura y cierre, especialmente útil para la
 * funcionalidad de "menú de hamburguesa" en dispositivos móviles.
 */

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Importa directivas para enlaces del router

@Component({
  selector: 'app-header', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que este es un componente standalone y no requiere un NgModule
  imports: [
    RouterLink, // Directiva para habilitar la navegación basada en rutas de Angular
    RouterLinkActive, // Directiva para aplicar clases CSS a enlaces activos del router
  ],
  templateUrl: './header.html', // Ruta al archivo de plantilla HTML de este componente
  styleUrl: './header.css', // Ruta al archivo de estilos CSS de este componente
})
export class Header {
  /**
   * @property isMenuOpen
   * @description Controla el estado actual del menú de navegación.
   * Si es `true`, el menú está abierto (visible); si es `false`, está cerrado (oculto).
   * Se utiliza para alternar la visibilidad del menú de hamburguesa en la UI.
   */
  isMenuOpen: boolean = false;

  // Nota: El constructor se ha omitido porque está vacío y no realiza ninguna inicialización.
  // TypeScript genera automáticamente un constructor por defecto si no se define uno.

  /**
   * @method toggleMenu
   * @description Alterna el estado de `isMenuOpen`.
   * Invierte el valor actual de `isMenuOpen`, abriendo el menú si está cerrado
   * y cerrándolo si está abierto. Este método se vincula al evento `(click)`
   * del botón de hamburguesa en `header.html`.
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * @method closeMenu
   * @description Establece explícitamente `isMenuOpen` a `false`.
   * Se utiliza principalmente para cerrar el menú de navegación después
   * de que un usuario hace clic en un enlace, asegurando que el menú
   * se oculte una vez que se ha seleccionado una opción.
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}