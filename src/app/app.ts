/*
 * Archivo: app.component.ts
 * Descripción: Este es el componente raíz de la aplicación Angular.
 * Define la estructura principal de la aplicación,
 * sirviendo como el punto de entrada para todos los demás componentes
 * y la lógica global.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/components/header/header'; // Importa el componente de cabecera
import { Footer } from './core/components/footer/footer'; // Importa el componente de pie de página

@Component({
  selector: 'app-root', // El selector HTML para este componente (usado en index.html)
  standalone: true, // Indica que este componente es independiente y no requiere un NgModule
  imports: [
    RouterOutlet, // Necesario para el enrutamiento (donde se cargan las vistas de las rutas)
    Header, // Permite el uso del componente Header en la plantilla de AppComponent
    Footer, // Permite el uso del componente Footer en la plantilla de AppComponent
  ],
  templateUrl: './app.html', // La ruta al archivo de plantilla HTML de este componente
  styleUrl: './app.css', // La ruta al archivo de estilos CSS de este componente
})
export class AppComponent {
  // No hay propiedades de clase necesarias en este componente raíz para la funcionalidad actual.
}