import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <h1 class="text-4xl md:text-6xl font-black italic tracking-tighter mb-8 md:mb-12 uppercase">VOTRE PANIER</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16" *ngIf="cart.cart().items.length > 0; else emptyCart">
        <div class="lg:col-span-2 space-y-4 md:space-y-6">
          <div *ngFor="let item of cart.cart().items" class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 md:p-6 border border-brand-blue/5 shadow-sm group">
            <div class="w-full sm:w-24 md:w-32 aspect-square bg-gray-100 overflow-hidden shrink-0 rounded-lg">
              <img [src]="item.product_image || 'https://images.unsplash.com/photo-1523381235208-e7bd991480cc?q=80&w=300'" class="w-full h-full object-cover">
            </div>

            <div class="flex-grow w-full">
              <h3 class="font-black italic text-lg md:text-xl tracking-tighter text-brand-blue uppercase hover:text-brand-brown cursor-pointer transition-colors" [routerLink]="['/products', item.product_id]">
                {{ item.product_name }}
              </h3>

              <div class="flex flex-wrap items-center gap-2 mt-2" *ngIf="item.selected_size || item.selected_color">
                <span *ngIf="item.selected_size" class="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                  Taille: <span class="text-brand-blue">{{ item.selected_size }}</span>
                </span>
                <span *ngIf="item.selected_color" class="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                  Couleur: <span class="text-brand-blue">{{ item.selected_color }}</span>
                </span>
              </div>

              <p class="text-brand-brown font-bold text-sm mt-2 tracking-tight">{{ item.unit_price | currency:'XOF' }}</p>

              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center border-2 border-brand-blue rounded-lg">
                  <button (click)="updateQty(item.id, item.quantity - 1)" class="px-3 py-1 hover:bg-brand-blue hover:text-white">-</button>
                  <span class="px-4 py-1 font-bold">{{ item.quantity }}</span>
                  <button (click)="updateQty(item.id, item.quantity + 1)" class="px-3 py-1 hover:bg-brand-blue hover:text-white">+</button>
                </div>
                <button (click)="cart.remove(item.id).subscribe()" class="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 underline">Supprimer</button>
              </div>
            </div>

            <div class="sm:text-right w-full sm:w-auto flex justify-between sm:flex-col items-center sm:items-end">
              <p class="text-xl md:text-2xl font-black italic tracking-tighter">{{ item.subtotal | currency:'XOF' }}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-brand-blue text-white p-6 md:p-10 sticky bottom-0 lg:static lg:top-32 space-y-6">
            <div>
              <h2 class="text-xl md:text-2xl font-black italic tracking-tighter mb-6 md:mb-8 border-b border-white/10 pb-4">RÉCAPITULATIF</h2>

              <div class="space-y-3 md:space-y-4 mb-6 md:mb-10">
                <div class="flex justify-between text-gray-300">
                  <span>Sous-total</span>
                  <span class="font-bold text-white">{{ cart.cart().total | currency:'XOF' }}</span>
                </div>
                <div class="flex justify-between text-gray-300">
                  <span>Livraison</span>
                  <span class="font-bold text-white">GRATUIT</span>
                </div>
              </div>

              <div class="flex justify-between text-2xl md:text-3xl font-black italic tracking-tighter border-t border-white/20 pt-4 md:pt-6">
                <span>TOTAL</span>
                <span class="text-brand-beige">{{ cart.cart().total | currency:'XOF' }}</span>
              </div>
            </div>

            <div *ngIf="!isAuthenticated()" class="bg-white/10 border border-white/10 p-4 md:p-5 space-y-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-brand-beige mb-2">Confirmation Client</p>
                <h3 class="text-lg font-black italic tracking-tighter">Est-ce votre première commande ?</h3>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="customerMode.set('first')"
                  class="border px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors"
                  [class.bg-brand-brown]="customerMode() === 'first'"
                  [class.border-brand-brown]="customerMode() === 'first'"
                  [class.text-white]="customerMode() === 'first'"
                  [class.border-white/20]="customerMode() !== 'first'"
                >
                  Oui
                </button>
                <button
                  type="button"
                  (click)="customerMode.set('returning')"
                  class="border px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors"
                  [class.bg-brand-brown]="customerMode() === 'returning'"
                  [class.border-brand-brown]="customerMode() === 'returning'"
                  [class.text-white]="customerMode() === 'returning'"
                  [class.border-white/20]="customerMode() !== 'returning'"
                >
                  Non
                </button>
              </div>

              <div *ngIf="customerMode() === 'first'" class="space-y-3">
                <input
                  type="text"
                  [(ngModel)]="customerName"
                  placeholder="Votre nom complet"
                  class="w-full bg-white text-brand-blue px-4 py-3 outline-none font-bold placeholder:text-gray-400"
                >
                <input
                  type="tel"
                  [(ngModel)]="customerPhone"
                  placeholder="Votre numero de telephone"
                  class="w-full bg-white text-brand-blue px-4 py-3 outline-none font-bold placeholder:text-gray-400"
                >
                <p class="text-[11px] text-white/80 leading-relaxed">
                  Nous allons creer votre fiche client automatiquement avec votre nom et votre numero.
                </p>
              </div>

              <div *ngIf="customerMode() === 'returning'" class="space-y-3">
                <input
                  type="tel"
                  [(ngModel)]="customerPhone"
                  placeholder="Numero utilise lors de votre derniere commande"
                  class="w-full bg-white text-brand-blue px-4 py-3 outline-none font-bold placeholder:text-gray-400"
                >
                <p class="text-[11px] text-white/80 leading-relaxed">
                  Nous allons rechercher votre fiche existante a partir de ce numero.
                </p>
              </div>
            </div>

            <div *ngIf="isAuthenticated()" class="bg-white/10 border border-white/10 p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-brand-beige mb-2">Client Connecté</p>
              <p class="text-sm leading-relaxed text-white/90">
                Votre commande sera rattachée à votre compte {{ currentUserName() }}.
              </p>
            </div>

            <button
              (click)="onCheckout()"
              [disabled]="isSubmitting()"
              class="w-full bg-brand-brown text-white py-4 md:py-5 font-black text-lg md:text-xl italic tracking-tighter hover:bg-white hover:text-brand-blue transition-colors uppercase disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Validation...' : 'Commander' }}
            </button>
          </div>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="text-center py-40 bg-white border border-dashed border-brand-blue/20">
          <lucide-angular name="shopping-cart" class="w-24 h-24 mx-auto text-brand-blue/10 mb-8"></lucide-angular>
          <h2 class="text-3xl font-black italic tracking-tighter opacity-30 mb-8 border-none">VOTRE PANIER EST VIDE</h2>
          <a routerLink="/products" class="inline-block bg-brand-blue text-white px-12 py-5 font-black text-xl italic tracking-tighter hover:bg-brand-brown transition-all uppercase">
            Commencer mes achats
          </a>
        </div>
      </ng-template>
    </div>
  `
})
export class CartPageComponent implements OnInit {
  cart = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  customerMode = signal<'first' | 'returning'>('first');
  customerName = '';
  customerPhone = '';
  isSubmitting = signal(false);
  currentUserName = computed(() => this.authService.currentUser()?.name ?? 'client');
  isAuthenticated = this.authService.isAuthenticated.bind(this.authService);

  ngOnInit() {
    this.cart.loadCart().subscribe();
  }

  updateQty(itemId: number, qty: number) {
    if (qty > 0) {
      this.cart.updateQuantity(itemId, qty).subscribe();
    } else {
      this.cart.remove(itemId).subscribe();
    }
  }

  onCheckout() {
    if (this.isSubmitting()) {
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.submitAuthenticatedCheckout();
      return;
    }

    if (this.customerMode() === 'first' && !this.customerName.trim()) {
      this.notification.error('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!this.customerPhone.trim()) {
      this.notification.error('Veuillez renseigner votre numero de telephone.');
      return;
    }

    this.isSubmitting.set(true);
    this.cart.guestCheckout({
      is_first_order: this.customerMode() === 'first',
      name: this.customerMode() === 'first' ? this.customerName.trim() : undefined,
      phone: this.customerPhone.trim(),
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.customerName = '';
        this.customerPhone = '';
        this.notification.success('Commande validée ! Nous avons bien enregistré votre demande.', 'Parfait !');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const details = err.error?.details;
        const firstDetail = details && typeof details === 'object'
          ? Object.values(details).find(value => typeof value === 'string')
          : null;

        this.notification.error(
          (firstDetail as string | null) ||
          err.error?.message ||
          'Erreur lors de la commande. Veuillez réessayer.'
        );
      }
    });
  }

  private submitAuthenticatedCheckout() {
    this.isSubmitting.set(true);
    this.cart.checkout().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notification.success('Commande validée ! Merci de votre confiance.', 'Parfait !');
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notification.error('Erreur lors de la commande. Veuillez réessayer.');
      }
    });
  }
}
