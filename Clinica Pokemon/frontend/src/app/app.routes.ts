import { Routes } from '@angular/router';

import { Inicio } from './features/inicio/inicio';
import { Pokedex } from './features/pokedex/pokedex';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { AuthGuard } from './core/guards/auth.guard';
import { Perfil } from './features/perfil/perfil';
import { StaffDashboard } from './features/staff-dashboard/staff-dashboard';

export const routes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: 'pokedex', component: Pokedex }, // ahora "Catálogo de especies"
  { path: 'login', component: Login },

  // Perfil (OWNER o STAFF) – require login
  { path: 'perfil', component: Perfil, canActivate: [AuthGuard] },

  // Registrar dueño – visible sólo si el menú te deja llegar (STAFF)
  { path: 'register', component: Register, canActivate: [AuthGuard] },

  // Panel staff – luego definimos guard por rol
  { path: 'panel', component: StaffDashboard, canActivate: [AuthGuard] },

  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' },
];

