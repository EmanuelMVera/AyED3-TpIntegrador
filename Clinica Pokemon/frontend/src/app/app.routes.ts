import { Routes } from '@angular/router';
import { authGuard, staffGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio),
  },
  {
    path: 'pokedex',
    loadComponent: () => import('./features/pokedex/pokedex').then(m => m.Pokedex),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil),
    canActivate: [authGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then(m => m.Register),
    canActivate: [staffGuard],
  },
  {
    path: 'panel',
    loadComponent: () => import('./features/staff-dashboard/staff-dashboard').then(m => m.StaffDashboard),
    canActivate: [staffGuard],
  },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' },
];
