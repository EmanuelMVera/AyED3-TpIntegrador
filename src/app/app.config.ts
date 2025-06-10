/*
 * Archivo: app.config.ts
 * Descripción: Configuración global de la aplicación Angular.
 * Define los proveedores de servicios y otras configuraciones a nivel de aplicación,
 * que son esenciales para el bootstrapping de la aplicación y la inyección de dependencias.
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http'; // Importaciones clave

import { routes } from './app.routes'; // Importa la definición de las rutas de la aplicación

export const appConfig: ApplicationConfig = {
  providers: [
    // Habilita la detección de cambios optimizada para mejorar el rendimiento.
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configura el enrutador de Angular con las rutas definidas para la aplicación.
    provideRouter(routes),

    // Provee listeners globales para errores del navegador, útil para depuración y monitoreo.
    provideBrowserGlobalErrorListeners(),

    // Configuración del cliente HTTP para realizar peticiones web.
    // - `withInterceptorsFromDi()`: Habilita el soporte para interceptores HTTP
    //   basados en el sistema de inyección de dependencias (DI) tradicional.
    // - `withFetch()`: (Recomendado para Angular 20) Configura HttpClient para usar
    //   la API Fetch del navegador en lugar de XMLHttpRequest, lo que puede ofrecer
    //   beneficios de rendimiento y mejor compatibilidad con SSR.
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
  ],
};