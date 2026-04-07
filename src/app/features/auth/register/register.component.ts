import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, BackButtonComponent],
    template: `
    <div class="min-h-[80vh] px-4 py-10">
      <div class="mx-auto mb-6 max-w-md">
        <app-back-button fallbackUrl="/" label="Retour accueil"></app-back-button>
      </div>
      <div class="flex items-center justify-center">
      <div class="max-w-md w-full bg-white p-12 shadow-2xl border border-brand-blue/5">
        <div class="text-center mb-10">
          <h1 class="text-4xl font-black italic tracking-tighter uppercase mb-2">S'inscrire</h1>
          <p class="text-brand-brown font-bold text-xs tracking-widest uppercase">Rejoindre l'aventure</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-6">
          <div>
            <label class="block text-xs font-black uppercase tracking-widest mb-2">Nom Complet</label>
            <input 
              type="text" 
              name="name"
              [(ngModel)]="formData.name"
              required
              class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold transition-all"
              placeholder="Jean Dupont"
            >
          </div>

          <div>
            <label class="block text-xs font-black uppercase tracking-widest mb-2">Adresse Email</label>
            <input 
              type="email" 
              name="email"
              [(ngModel)]="formData.email"
              required
              class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold transition-all"
              placeholder="votre@mail.com"
            >
          </div>

          <div>
            <label class="block text-xs font-black uppercase tracking-widest mb-2">Mot de passe</label>
            <input 
              type="password" 
              name="password"
              [(ngModel)]="formData.password"
              required
              minlength="6"
              class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold transition-all"
              placeholder="••••••••"
            >
          </div>

          <div *ngIf="error()" class="bg-red-50 text-red-600 p-4 text-sm font-bold border-l-4 border-red-600">
            {{ error() }}
          </div>

          <button 
            type="submit"
            [disabled]="loading()"
            class="w-full bg-brand-blue text-white py-4 font-black text-xl italic tracking-tighter hover:bg-brand-brown transition-all uppercase disabled:opacity-50"
          >
            {{ loading() ? 'Création...' : 'Créer un compte' }}
          </button>
        </form>

        <div class="mt-8 pt-8 border-t border-brand-blue/10 text-center">
          <p class="text-sm font-bold text-gray-400 uppercase tracking-tight">
            Déjà client ? 
            <a routerLink="/auth/login" class="text-brand-brown hover:text-brand-blue underline ml-1">Se connecter</a>
          </p>
        </div>
      </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    formData = { name: '', email: '', password: '' };
    loading = signal(false);
    error = signal<string | null>(null);

    onSubmit() {
        this.loading.set(true);
        this.error.set(null);
        this.authService.register(this.formData).subscribe({
            next: () => this.router.navigate(['/']),
            error: (err) => {
                this.error.set(err.error?.message || 'Erreur lors de l’inscription');
                this.loading.set(false);
            }
        });
    }
}
