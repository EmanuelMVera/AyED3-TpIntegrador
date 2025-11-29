import { Routes } from '@angular/router';

import { Inicio } from './features/inicio/inicio';
import { Pokedex } from './features/pokedex/pokedex';
import { CrearPokemon } from './features/crear-pokemon/crear-pokemon';
import { Nosotros } from './features/nosotros/nosotros';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { AuthGuard } from './core/guards/auth.guard';
import { Perfil } from './features/perfil/perfil';

export const routes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: 'pokedex', component: Pokedex },
  { path: 'crear-pokemon', component: CrearPokemon, canActivate: [AuthGuard] },
  { path: 'nosotros', component: Nosotros },
  { path: 'perfil', component: Perfil, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' },
];
