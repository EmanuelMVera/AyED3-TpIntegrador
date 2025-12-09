import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export type UserRole = 'OWNER' | 'STAFF' | 'ADMIN';

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // OJO: base de la API, no /auth directo
  private apiUrl = 'http://localhost:4000/api';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(
    this.loadUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ========= helpers de estado =========

  private loadUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: CurrentUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isOwner(): boolean {
    return this.currentUserSubject.value?.role === 'OWNER';
  }

  isStaff(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'STAFF' || role === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // ========= auth calls =========

  /** Login: aquí SÍ actualizamos la sesión */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.saveSession(res.token, res.user);
        })
      );
  }

  /**
   * Registrar dueño.
   * IMPORTANTE: aquí NO tocamos la sesión actual, porque la usa el STAFF.
   * Sólo devolvemos la respuesta del backend.
   */
  registerOwner(payload: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register`,
      payload
    );
  }
}
