// src/app/features/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-owner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phone = '';
  address = '';

  error = '';
  success = '';

  constructor(private authService: AuthService, private router: Router) {}

  registerOwner(): void {
    this.error = '';
    this.success = '';

    this.authService
      .registerOwner({
        username: this.username,
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        address: this.address,
      })
      .subscribe({
        // no usamos res, así evitamos que TS se queje
        next: () => {
          this.success = 'Cliente creado correctamente.';

          // Opcional: limpiar formulario
          this.username = '';
          this.email = '';
          this.password = '';
          this.firstName = '';
          this.lastName = '';
          this.phone = '';
          this.address = '';

          // Opcional: navegar al panel
          // this.router.navigate(['/panel']);
        },
        error: (err: any) => {
          console.error('Error al registrar dueño:', err);
          this.error =
            err?.error?.error ||
            'Error al crear el cliente. Revisa los datos.';
        },
      });
  }
}
