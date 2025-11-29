/*
 * Archivo: inicio.component.ts
 * Descripción: Define el componente para la página de inicio de la aplicación.
 * Este componente es puramente presentacional y no contiene lógica
 * ni estado dinámico propio. Su contenido y estilo se definen
 * completamente en `inicio.html` y `inicio.css`.
 */

import { Component } from '@angular/core'; // Importa el decorador Component de Angular
import { RouterLink } from '@angular/router'; // Importa RouterLink para la navegación declarativa en la plantilla

/**
 * @Component
 * @description Componente para la página de inicio de la aplicación.
 * Este componente es standalone, lo que significa que no necesita
 * ser declarado en un NgModule y puede importar sus dependencias directamente.
 */
@Component({
  selector: 'app-inicio', // Selector CSS para usar este componente en plantillas HTML (ej. app.html)
  standalone: true, // Indica que es un componente standalone en Angular
  imports: [RouterLink], // `RouterLink` es necesario para el botón de navegación en `inicio.html`
  templateUrl: './inicio.html', // Ruta al archivo de plantilla HTML de este componente
  styleUrl: './inicio.css', // Ruta al archivo de estilos CSS de este componente
})
export class Inicio {
  // Este componente no requiere propiedades ni métodos propios,
  // ya que su propósito es puramente mostrar contenido estático
  // y un botón de navegación, definidos en su plantilla HTML.
}