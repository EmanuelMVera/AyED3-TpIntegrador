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

  formData = this.getInitialFormData();

  // Variables para confirmación
  confirmEmail: string = '';
  confirmPassword: string = '';

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

  // registerOwner(): void {
  // this.error = '';
  // this.success = '';

  // this.authService.registerOwner(this.formData).subscribe({
  // next: () => {
  // this.success = 'Cliente creado correctamente.';
  // this.formData = this.getInitialFormData(); // Reset total en una línea

  // // Descomentar si deseas redirigir:
  // // this.router.navigate(['/panel']);
  // },
  // error: (err) => {
  // console.error('Error al registrar dueño:', err);
  // this.error = err?.error?.error || 'Error al crear el cliente. Revisa los datos.';
  // },
  // });
  // }

  // Validación lógica: ¿coinciden los campos?
  fieldsMatch(): boolean {
    return (
      this.formData.email === this.confirmEmail &&
      this.formData.password === this.confirmPassword &&
      this.formData.email !== '' &&
      this.formData.password !== ''
    );
  }

  registerOwner(): void {
    if (!this.fieldsMatch()) {
      this.error = 'El correo o la contraseña no coinciden.';
      return;
    }

    this.error = '';
    this.success = '';

    this.authService.registerOwnerAsStaff(this.formData).subscribe({
      next: () => {
        this.success = 'Cliente creado correctamente.';
        this.formData = this.getInitialFormData();
        this.confirmEmail = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        console.error('Error al registrar dueño:', err);
        this.error =
          err?.error?.error || 'Error al crear el cliente. Revisa los datos.';
      },
    });
  }
}
