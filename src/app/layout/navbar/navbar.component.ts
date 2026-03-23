import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="bg-brand-blue text-white shadow-xl sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
          <!-- Logo Section -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center" (click)="closeMobileMenu()">
              <img src="/TATREND1.PNG" alt="TATREND Logo" class="h-16 w-auto hover:opacity-80 transition-opacity">
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-10">
            <ng-container *ngIf="auth.isAdmin(); else regularMenu">
              <a routerLink="/admin" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors active:text-brand-beige" routerLinkActive="text-brand-beige" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
              <a routerLink="/admin/orders" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors" routerLinkActive="text-brand-beige">Commandes</a>
              <a routerLink="/admin/inventory" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors" routerLinkActive="text-brand-beige">Inventaire</a>
              <a routerLink="/admin/subscribers" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors" routerLinkActive="text-brand-beige">Abonnés</a>
            </ng-container>
            <ng-template #regularMenu>
              <a routerLink="/" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors active:text-brand-beige" routerLinkActive="text-brand-beige" [routerLinkActiveOptions]="{exact: true}">Accueil</a>
              <a [routerLink]="['/']" fragment="categories" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors">Catégories</a>
              <a [routerLink]="['/']" fragment="movement" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors">Mouvement</a>
              <a [routerLink]="['/']" fragment="testimonials" class="text-sm font-black uppercase tracking-widest hover:text-brand-beige transition-colors">Avis</a>
            </ng-template>
          </div>

          <!-- Action Icons Section -->
          <div class="flex items-center space-x-4 md:space-x-6">
            <!-- Cart Icon -->
            <div class="relative cursor-pointer group" routerLink="/cart" (click)="closeMobileMenu()">
              <lucide-angular name="shopping-cart" class="w-6 h-6 group-hover:text-brand-beige transition-colors"></lucide-angular>
              <span *ngIf="cartCount() > 0" class="absolute -top-2 -right-2 bg-brand-brown text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-brand-blue">
                {{ cartCount() }}
              </span>
            </div>

            <!-- Auth/Profile Section -->
            <ng-container *ngIf="auth.currentUser() as user; else guest">
              <div class="hidden md:flex items-center space-x-4 border-l border-white/10 pl-4 ml-2">
                <a routerLink="/orders" class="hover:text-brand-beige transition-colors" title="Historique">
                  <lucide-angular name="history" class="w-5 h-5"></lucide-angular>
                </a>
                <a *ngIf="auth.isAdmin()" routerLink="/admin" class="bg-brand-brown px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-brand-blue transition-all">
                  Admin
                </a>
                <span class="text-xs font-black uppercase tracking-wider">{{ user.name }}</span>
                <button (click)="auth.logout()" class="hover:text-red-400 transition-colors" title="Déconnexion">
                  <lucide-angular name="log-out" class="w-5 h-5"></lucide-angular>
                </button>
              </div>
            </ng-container>

            <!-- Guest Login -->
            <ng-template #guest>
              <a routerLink="/auth/login" class="hidden md:flex items-center space-x-2 hover:text-brand-beige transition-colors">
                <lucide-angular name="user" class="w-6 h-6"></lucide-angular>
                <span class="text-xs font-black uppercase tracking-widest">Connexion</span>
              </a>
            </ng-template>

            <!-- Mobile Menu Toggle Button -->
            <button class="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" (click)="toggleMobileMenu()">
              <lucide-angular [name]="isMobileMenuOpen() ? 'x' : 'menu'" class="w-8 h-8"></lucide-angular>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Sidebar Overlay -->
      <div *ngIf="isMobileMenuOpen()" class="fixed inset-0 bg-brand-blue/60 backdrop-blur-sm z-40 md:hidden" (click)="closeMobileMenu()"></div>
      
      <!-- Mobile Menu Sidebar Container -->
      <div class="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-brand-blue shadow-2xl z-50 transform transition-transform duration-300 md:hidden pb-8 flex flex-col"
           [class.translate-x-0]="isMobileMenuOpen()" 
           [class.translate-x-full]="!isMobileMenuOpen()">
        
        <div class="p-6 border-b border-white/10 flex justify-between items-center h-20">
          <img src="/TATREND1.PNG" alt="TATREND Logo" class="h-12 w-auto">
          <button (click)="closeMobileMenu()" class="p-2 hover:bg-white/10 rounded-lg">
            <lucide-angular name="x" class="w-8 h-8 text-brand-beige"></lucide-angular>
          </button>
        </div>

        <div class="flex-grow overflow-y-auto px-6 py-8">
          <nav class="flex flex-col space-y-6">
            <ng-container *ngIf="auth.isAdmin(); else regularMobileMenu">
              <a routerLink="/admin" (click)="closeMobileMenu()" class="text-xl font-black uppercase tracking-[0.2em] hover:text-brand-beige py-2 border-b border-white/5 transition-all">Dashboard</a>
              <a routerLink="/admin/orders" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Commandes</a>
              <a routerLink="/admin/inventory" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Inventaire</a>
              <a routerLink="/admin/subscribers" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Abonnés</a>
            </ng-container>
            <ng-template #regularMobileMenu>
              <a routerLink="/" (click)="closeMobileMenu()" class="text-xl font-black uppercase tracking-[0.2em] hover:text-brand-beige py-2 border-b border-white/5 transition-all">Accueil</a>
              
              <div class="flex flex-col space-y-4 pt-2">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-brand-beige/60 ml-1">Découvrir</p>
                <a [routerLink]="['/']" fragment="categories" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Catégories</a>
                <a [routerLink]="['/']" fragment="movement" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Mouvement</a>
                <a [routerLink]="['/']" fragment="testimonials" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Avis Clients</a>
              </div>

              <div class="flex flex-col space-y-4 pt-4 border-t border-white/5">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-brand-beige/60 ml-1">Boutique</p>
                <a routerLink="/products" (click)="closeMobileMenu()" class="text-lg font-bold hover:text-brand-beige transition-all pl-2 border-l border-white/10">Tous les produits</a>
                <a *ngFor="let cat of categories()" 
                   [routerLink]="['/products']" 
                   [queryParams]="{category_id: cat.id}" 
                   (click)="closeMobileMenu()" 
                   class="text-sm font-medium hover:text-brand-beige transition-all pl-4 text-white/70">
                  {{ cat.name }}
                </a>
              </div>
            </ng-template>
            
            <div class="pt-8 border-t border-white/10">
              <ng-container *ngIf="auth.currentUser() as user; else guestMobile">
                <div class="flex flex-col space-y-4">
                  <div class="flex items-center space-x-4 mb-4">
                    <div class="w-10 h-10 rounded-full bg-brand-brown/20 flex items-center justify-center font-black text-brand-beige">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-black uppercase tracking-wider">{{ user.name }}</span>
                  </div>
                  <a routerLink="/orders" (click)="closeMobileMenu()" class="flex items-center space-x-3 text-lg font-bold hover:text-brand-beige transition-all">
                    <lucide-angular name="history" class="w-5 h-5"></lucide-angular>
                    <span>Commandes</span>
                  </a>
                  <a *ngIf="auth.isAdmin()" routerLink="/admin" (click)="closeMobileMenu()" class="flex items-center space-x-3 text-lg font-black text-brand-brown hover:text-white transition-all uppercase tracking-widest">
                    <span>Espace Admin</span>
                  </a>
                  <button (click)="auth.logout(); closeMobileMenu()" class="flex items-center space-x-3 text-lg font-bold text-red-400 hover:text-red-300 transition-all pt-4">
                    <lucide-angular name="log-out" class="w-5 h-5"></lucide-angular>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </ng-container>
              <ng-template #guestMobile>
                <a routerLink="/auth/login" (click)="closeMobileMenu()" class="flex items-center space-x-3 text-xl font-black uppercase tracking-widest bg-brand-brown py-4 justify-center rounded-xl hover:bg-white hover:text-brand-blue transition-all">
                  <lucide-angular name="user" class="w-6 h-6"></lucide-angular>
                  <span>Connexion</span>
                </a>
              </ng-template>
            </div>
          </nav>
        </div>

        <div class="px-6 py-6 border-t border-white/10 text-center">
          <p class="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">TATREND &copy; {{ currentYear }}</p>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  cartCount = inject(CartService).itemCount;
  private productService = inject(ProductService);

  categories = signal<Category[]>([]);
  isMobileMenuOpen = signal(false);
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.productService.getCategories().subscribe(res => {
      this.categories.set(res);
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = 'auto';
  }
}
