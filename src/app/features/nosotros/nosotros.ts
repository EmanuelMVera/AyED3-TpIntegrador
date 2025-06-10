/*
 * Archivo: nosotros.component.ts
 * Descripción: Componente Angular para la sección "Acerca de Nosotros" de la aplicación.
 * Este componente es principalmente un contenedor para la plantilla HTML,
 * sin lógica de negocio compleja ni estado.
 */

import { Component } from '@angular/core'; // Importa el decorador Component de Angular

/**
 * @Component
 * @description Componente Angular que representa la sección "Acerca de Nosotros" (o "Sobre Mí").
 * Es un componente de presentación puro, que se encarga de renderizar el contenido HTML
 * definido en `nosotros.html` y aplicar los estilos de `nosotros.css`.
 *
 * Es un componente 'standalone', lo que significa que puede ser utilizado sin necesidad
 * de ser declarado en un NgModule.
 */
@Component({
  selector: 'app-nosotros', // El selector CSS que se usará en las plantillas HTML para invocar este componente.
  standalone: true, // Indica que este es un componente "standalone" (autónomo), no necesita un NgModule.
  templateUrl: './nosotros.html', // La ruta al archivo de plantilla HTML asociado a este componente.
  styleUrl: './nosotros.css', // La ruta al archivo de estilos CSS asociado a este componente.
})
export class Nosotros {
  // La clase 'Nosotros' es intencionalmente vacía porque este componente
  // no necesita propiedades, métodos ni lógica interactiva.
  // Su propósito es meramente mostrar contenido estático definido en su plantilla HTML.
}