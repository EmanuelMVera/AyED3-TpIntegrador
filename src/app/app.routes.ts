/*
 * Archivo: app.routes.ts
 * Descripción: Define las rutas principales de la aplicación Angular.
 * Este archivo configura cómo se navega entre las diferentes
 * vistas (componentes) de la aplicación, asociando URLs
 * a componentes específicos.
 */

import { Routes } from '@angular/router';

// 1. Importación de Componentes
//    Se importan los componentes que serán asociados a las diferentes rutas.
import { Inicio } from './features/inicio/inicio';
import { Pokedex } from './features/pokedex/pokedex';
import { CrearPokemon } from './features/crear-pokemon/crear-pokemon';
import { Nosotros } from './features/nosotros/nosotros';

// 2. Definición de Rutas de la Aplicación
//    `routes` es un array de objetos `Route`, donde cada objeto define:
//    - `path`: La parte de la URL que activa esta ruta.
//    - `component`: El componente Angular que se renderizará cuando la ruta esté activa.
export const routes: Routes = [
  // Ruta para la página de inicio.
  { path: 'inicio', component: Inicio },
  // Ruta para la Pokedex, donde se listan y gestionan los Pokémon.
  { path: 'pokedex', component: Pokedex },
  // Ruta para el formulario de creación de nuevos Pokémon.
  { path: 'crear-pokemon', component: CrearPokemon },
  // Ruta para la sección "Sobre Nosotros" o información de la aplicación.
  { path: 'nosotros', component: Nosotros },

  // 3. Redirección para la Ruta Raíz
  //    Cuando la URL es la raíz de la aplicación (''), redirige al usuario a '/inicio'.
  //    `pathMatch: 'full'` asegura que la redirección ocurra solo si la URL coincide
  //    exactamente con la ruta especificada (la cadena vacía en este caso).
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },

  // 4. Ruta Comodín (Wildcard Route)
  //    Esta ruta captura cualquier URL que no coincida con ninguna de las rutas definidas
  //    anteriormente. Es útil para manejar errores 404 o redirigir a una página predeterminada.
  //    Aquí, cualquier ruta no encontrada redirige también a '/inicio'.
  { path: '**', redirectTo: '/inicio' },
];