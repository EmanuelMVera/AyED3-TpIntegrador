import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PokemonService } from '../../core/services/pokemon.service';
import { POKEMON_TYPE_TRANSLATIONS } from '../../shared/constants/pokemon-types';

@Component({
  selector: 'app-crear-pokemon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-pokemon.html',
  styleUrl: './crear-pokemon.css'
})
export class CrearPokemon implements OnInit {
  private fb = inject(FormBuilder);
  private pokemonService = inject(PokemonService);

  typeTranslations = POKEMON_TYPE_TRANSLATIONS;
  allPokemonTypes: string[] = [];
  pokemonForm!: FormGroup;

  // Usamos Signals para un estado más reactivo y limpio
  previewImageUrl = signal<string | null>(null);
  showSuccessMessage = signal(false);

  ngOnInit(): void {
    this.allPokemonTypes = this.pokemonService.getAllPokemonTypes();
    this.initForm();

    // Simplificamos la lógica de la vista previa suscribiéndonos solo a los cambios de valor
    this.pokemonForm.get('imageUrl')?.valueChanges.subscribe(url => {
      const control = this.pokemonForm.get('imageUrl');
      this.previewImageUrl.set(control?.valid && url ? url : null);
    });
  }

  private initForm(): void {
    this.pokemonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9\s-]+$/)]],
      types: [[], [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^(http(s?):\/\/(.)*\.(jpg|jpeg|png|gif|webp)(\/.*)?)$/i)]]
    });
  }

  onTypeChange(type: string): void {
    const control = this.pokemonForm.get('types');
    const currentTypes: string[] = control?.value || [];
    const index = currentTypes.indexOf(type);

    if (index > -1) {
      control?.setValue(currentTypes.filter(t => t !== type));
    } else if (currentTypes.length < 2) {
      control?.setValue([...currentTypes, type]);
    }
    control?.markAsDirty();
  }

  isTypeSelected(type: string): boolean {
    return this.pokemonForm.get('types')?.value.includes(type);
  }

  onSubmit(): void {
    if (this.pokemonForm.invalid) {
      this.pokemonForm.markAllAsTouched(); // Método nativo de Angular, reemplaza tu función recursiva
      return;
    }

    const newPokemon = { ...this.pokemonForm.value, name: this.pokemonForm.value.name.toLowerCase() };

    this.pokemonService.addPokemon(newPokemon).subscribe({
      next: () => {
        this.showSuccessMessage.set(true);
        this.onClear();
        setTimeout(() => this.showSuccessMessage.set(false), 3000);
      }
    });
  }

  onClear(): void {
    this.pokemonForm.reset({ types: [] }); // Pasamos el valor inicial de types directamente en el reset
    this.previewImageUrl.set(null);
  }

  getTranslatedType(type: string): string {
    return this.typeTranslations[type.toLowerCase()] || type;
  }
}