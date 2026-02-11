import { Component, inject } from '@angular/core';
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
  private authService = inject(AuthService);
  private router = inject(Router);

  // Agrupamos el formulario en un objeto
  formData = this.getInitialFormData();
  
  error = '';
  success = '';

  private getInitialFormData() {
    return {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
    };
  }

  registerOwner(): void {
    this.error = '';
    this.success = '';

    this.authService.registerOwner(this.formData).subscribe({
      next: () => {
        this.success = 'Cliente creado correctamente.';
        this.formData = this.getInitialFormData(); // Reset total en una línea
        
        // Descomentar si deseas redirigir:
        // this.router.navigate(['/panel']);
      },
      error: (err) => {
        console.error('Error al registrar dueño:', err);
        this.error = err?.error?.error || 'Error al crear el cliente. Revisa los datos.';
      },
    });
  }
}