import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimización de detección de cambios
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    provideRouter(routes),

    // Configuración moderna de HTTP
    provideHttpClient(
      withFetch(), // Habilita la API fetch para mejor rendimiento
      withInterceptors([authInterceptor]) // Registra el interceptor funcional directamente
    ),
  ],
};