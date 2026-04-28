import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category } from '../../../core/models';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, BackButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Breadcrumbs & Title -->
      <div class="mb-12">
        <app-back-button fallbackUrl="/" label="Retour accueil" class="mb-6 block"></app-back-button>
        <h1 class="text-5xl font-black italic tracking-tighter mb-4">NOTRE COLLECTION</h1>
        <div class="rounded-[2rem] border border-brand-blue/10 bg-brand-beige/40 p-3 md:p-4">
          <div class="mb-3 flex items-center justify-between gap-4">
            <div>
              <p class="text-[11px] font-black uppercase tracking-[0.28em] text-brand-brown">Filtres categories</p>
            </div>
            <button
              *ngIf="activeCategoryId() !== null"
              (click)="filterByCategory(null)"
              class="shrink-0 rounded-full border border-brand-blue/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
            >
              Reinitialiser
            </button>
          </div>

          <div class="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button 
            (click)="filterByCategory(null)"
            class="shrink-0 rounded-full border-2 px-5 py-3 text-sm transition-all font-bold tracking-tight"
            [ngClass]="activeCategoryId() === null ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-white text-brand-blue border-brand-blue/15 hover:border-brand-blue hover:bg-brand-blue/5'"
          >
            Toutes les categories
          </button>
          <button 
            *ngFor="let cat of categories()" 
            (click)="filterByCategory(cat.id)"
            class="shrink-0 rounded-full border-2 px-5 py-3 text-sm transition-all font-bold tracking-tight"
            [ngClass]="activeCategoryId() === cat.id ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-white text-brand-blue border-brand-blue/15 hover:border-brand-blue hover:bg-brand-blue/5'"
          >
            {{ cat.name | uppercase }}
          </button>
        </div>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4 border-b border-brand-blue/10 pb-4">
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-brand-brown">
            {{ products().length }} produits affiches
          </p>
          <a routerLink="/" fragment="categories" class="text-sm font-black uppercase tracking-[0.18em] text-brand-blue transition hover:text-brand-brown">
            Voir les 4 categories en vitrine
          </a>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        <div *ngFor="let product of products(); let i = index" class="group animate-fade-in-up" [style.animation-delay]="(i % 4) * 100 + 'ms'">
          <div class="aspect-[4/5] bg-gray-50 overflow-hidden relative mb-6 rounded-2xl transition-all duration-500 group-hover:shadow-xl border border-transparent group-hover:border-brand-blue/5 cursor-pointer" [routerLink]="['/products', product.id]">
            <!-- Badges -->
            <div *ngIf="product.original_price" class="badge badge-reduction">
              -{{ ((product.original_price - product.price) / product.original_price * 100) | number:'1.0-0' }}%
            </div>

            <!-- Main Image -->
            <img [src]="product.image_url || 'https://images.unsplash.com/photo-1523381235208-e7bd991480cc?q=80&w=800'" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            
            <!-- Floating Actions -->
            <div class="absolute top-4 right-4 flex flex-col space-y-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <button class="product-action-btn" title="Ajouter aux favoris" (click)="$event.stopPropagation()">
                <lucide-angular name="heart" class="w-5 h-5"></lucide-angular>
              </button>
              <button class="product-action-btn" title="Apercu rapide" (click)="$event.stopPropagation()">
                <lucide-angular name="eye" class="w-5 h-5"></lucide-angular>
              </button>
            </div>

            <!-- Detail Link Overlay -->
            <div class="absolute bottom-0 left-0 right-0 bg-brand-blue/80 text-white py-4 font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center space-x-2 z-10">
              <span class="uppercase tracking-widest text-[10px] font-black">Voir les détails</span>
            </div>
          </div>
          
          <div class="text-center px-2">
            <p class="text-[10px] font-bold text-brand-brown tracking-[0.2em] mb-2 uppercase">{{ product.category_name }}</p>
            <h3 class="font-bold text-lg leading-tight mb-2 hover:text-brand-brown transition-colors cursor-pointer uppercase tracking-tighter" [routerLink]="['/products', product.id]">{{ product.name }}</h3>
            
            <!-- Price Display -->
            <div class="flex items-center justify-center space-x-3">
              <p class="font-black text-2xl tracking-tighter text-brand-blue italic">{{ product.price | currency:'XOF' }}</p>
              <p *ngIf="product.original_price" class="text-sm text-gray-400 line-through font-bold decoration-brand-brown/50 underline-offset-4">{{ product.original_price | currency:'XOF' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="products().length === 0" class="py-40 text-center">
        <lucide-angular name="shopping-bag" class="w-20 h-20 mx-auto text-brand-blue/10 mb-6"></lucide-angular>
        <p class="text-2xl font-bold tracking-tighter opacity-30 italic">AUCUN PRODUIT TROUVÉ</p>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService); // Added
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Added
  cart = inject(CartService);
  private notification = inject(NotificationService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  activeCategoryId = signal<number | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const catId = params['category_id'] ? parseInt(params['category_id']) : null;
      this.activeCategoryId.set(catId);
      this.loadData();
    });
  }

  loadData() {
    this.productService.getCatalog(this.activeCategoryId() ?? undefined).subscribe(data => {
      this.products.set(data.products);
      this.categories.set(data.categories);
    });
  }

  filterByCategory(id: number | null) {
    this.activeCategoryId.set(id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: id ? { category_id: id } : {},
    });
  }
}
