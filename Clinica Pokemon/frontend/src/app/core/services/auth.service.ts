import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

interface LoginResponse {
  message: string;
  token: string;
  username: string;
  email: string;
}

interface RegisterResponse {
  message: string;
  user: {
    username: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  // BehaviorSubject para emitir estado del usuario logueado
  private currentUserSubject = new BehaviorSubject<{ username: string | null; email: string | null } | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Si hay sesión previa, restaurar
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    if (username && email) {
      this.currentUserSubject.next({ username, email });
    }
  }

  /** Registrar usuario */
  register(username: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, { username, email, password });
  }

  /** Iniciar sesión */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('email', res.email);
          this.currentUserSubject.next({ username: res.username, email: res.email });
        }
      })
    );
  }

  /** Cerrar sesión */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    this.currentUserSubject.next(null);
  }

  /** Obtener token */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Verificar si el usuario está autenticado */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Obtener datos del usuario actual */
  getCurrentUser(): { username: string | null; email: string | null } | null {
    return this.currentUserSubject.value;
  }
}
