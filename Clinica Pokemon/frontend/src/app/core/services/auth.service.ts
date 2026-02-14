import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  private _currentUser = signal<CurrentUser | null>(this.loadUserFromStorage());

  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => !!this._currentUser());
  public isOwner = computed(() => this._currentUser()?.role === 'OWNER');
  public isStaff = computed(() => {
    const role = this._currentUser()?.role;
    return role === 'STAFF' || role === 'ADMIN';
  });

  private loadUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: CurrentUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this._currentUser.set(user);
  }

  private mapAuthResponseToUser(res: AuthResponse): CurrentUser {
    return {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role,
      firstName: res.firstName ?? null,
      lastName: res.lastName ?? null,
      phone: res.phone ?? null,
      address: res.address ?? null,
    };
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this._currentUser.set(null);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => this.saveSession(res.token, this.mapAuthResponseToUser(res)))
      );
  }

  // Registro público (si lo usás en futuro "crear cuenta")
  registerOwnerPublic(payload: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, payload)
      .pipe(
        tap((res) => this.saveSession(res.token, this.mapAuthResponseToUser(res)))
      );
  }

  // Registro interno desde staff/admin (NO pisa sesión actual)
  registerOwnerAsStaff(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, payload);
  }
}
