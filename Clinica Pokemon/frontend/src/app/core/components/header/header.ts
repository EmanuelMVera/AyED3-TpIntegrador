import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, CurrentUser } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isMenuOpen = false;
  username: string | null = null;
  role: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Escuchar cambios del usuario logueado
    this.authService.currentUser$.subscribe((user: CurrentUser | null) => {
      this.username = user?.username ?? null;
      this.role = user?.role ?? null;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /** Para mostrar opciones de staff/admin en el menú */
  isStaff(): boolean {
    return this.authService.isStaff();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
