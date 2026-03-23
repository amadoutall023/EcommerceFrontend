import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white p-12 shadow-2xl border border-brand-blue/5">
        <div class="text-center mb-10">
          <h1 class="text-4xl font-black italic tracking-tighter uppercase mb-2">Connexion</h1>
          <p class="text-brand-brown font-bold text-xs tracking-widest uppercase">Bienvenue à nouveau</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
          <div>
            <label class="block text-xs font-black uppercase tracking-widest mb-2">Adresse Email</label>
            <input 
              type="email" 
              name="email"
              [(ngModel)]="credentials.email"
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
              [(ngModel)]="credentials.password"
              required
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
            {{ loading() ? 'Chargement...' : 'Se connecter' }}
          </button>
        </form>

        <div class="mt-8 pt-8 border-t border-brand-blue/10 text-center">
          <p class="text-sm font-bold text-gray-400 uppercase tracking-tight">
            Pas encore de compte ? 
            <a routerLink="/auth/register" class="text-brand-brown hover:text-brand-blue underline ml-1">Créer un compte</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Check for redirect URL
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');

        if (redirectUrl) {
          this.router.navigateByUrl(redirectUrl);
        } else if (this.authService.isAdmin()) {
          // Admin users go to dashboard
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Identifiants invalides');
        this.loading.set(false);
      }
    });
  }
}

