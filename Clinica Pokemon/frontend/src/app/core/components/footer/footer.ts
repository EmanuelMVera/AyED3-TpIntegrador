/*
 * Archivo: footer.component.ts
 * Descripción: Define el componente de pie de página (<app-footer>).
 * Este componente es puramente presentacional y no contiene lógica
 * ni estado dinámico propio. Su contenido y estilo se definen
 * completamente en `footer.html` y `footer.css`.
 */

import { Component } from '@angular/core'; // Importa el decorador Component de Angular

@Component({
  selector: 'app-footer', // Selector CSS para usar este componente en plantillas HTML (ej. app.html)
  standalone: true, // Indica que este es un componente standalone y no requiere un NgModule
  imports: [], // No se requieren otras directivas, componentes o módulos de Angular para este componente
  templateUrl: './footer.html', // Ruta al archivo de plantilla HTML de este componente
  styleUrl: './footer.css', // Ruta al archivo de estilos CSS de este componente
})
export class Footer {
  // Este componente no requiere propiedades ni métodos propios,
  // ya que su propósito es puramente mostrar contenido estático definido en su plantilla HTML.
}