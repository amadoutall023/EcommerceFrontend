import { Component, inject, signal, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12 md:py-24" *ngIf="product() as p">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        <!-- Left: Image Gallery (5 cols) -->
        <div class="lg:col-span-7 grid grid-cols-12 gap-4">
          <!-- Thumbnails -->
          <div class="col-span-2 space-y-4">
            <div 
              *ngFor="let img of allImages(); let i = index"
              (click)="activeImage.set(img)"
              class="aspect-[4/5] bg-gray-50 border-2 cursor-pointer transition-all duration-300 overflow-hidden rounded-lg"
              [class.border-brand-blue]="activeImage() === img"
              [class.border-transparent]="activeImage() !== img"
            >
              <img [src]="img" class="w-full h-full object-cover">
            </div>
          </div>
          
          <!-- Main Preview -->
          <div class="col-span-10 bg-gray-50 aspect-[4/5] overflow-hidden rounded-2xl border border-brand-blue/5 shadow-inner relative group">
            <img [src]="activeImage() || p.image_url" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div *ngIf="p.original_price" class="absolute top-6 left-6 bg-brand-brown text-white px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full shadow-xl">
              -{{ ((p.original_price - p.price) / p.original_price * 100) | number:'1.0-0' }}%
            </div>
          </div>
        </div>

        <!-- Right: info (5 cols) -->
        <div class="lg:col-span-5 flex flex-col pt-4">
          <nav class="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
            <a routerLink="/" class="hover:text-brand-blue">Accueil</a>
            <span>/</span>
            <a [routerLink]="['/products']" [queryParams]="{category_id: p.category_id}" class="hover:text-brand-blue">{{ p.category_name }}</a>
          </nav>

          <h1 class="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 leading-none uppercase text-brand-blue">{{ p.name }}</h1>
          
          <div class="flex items-baseline space-x-4 mb-8">
            <span class="text-4xl font-black tracking-tighter text-brand-blue italic">{{ p.price | currency:'XOF' }}</span>
            <span *ngIf="p.original_price" class="text-xl text-gray-400 line-through font-bold decoration-brand-brown decoration-2">{{ p.original_price | currency:'XOF' }}</span>
          </div>

          <p class="text-gray-600 leading-relaxed text-lg mb-10 border-l-4 border-brand-beige pl-6 py-2">
            {{ p.description || fallbackDescription }}
          </p>

          <!-- Variant Selections -->
          <div class="space-y-10 mb-12">
            <!-- Sizes -->
            <div *ngIf="p.sizes && p.sizes.length > 0">
              <div class="flex justify-between items-center mb-4">
                <label class="font-black text-xs tracking-widest uppercase text-brand-blue">Sélectionnez la Taille</label>
                <button class="text-[10px] font-bold text-brand-brown border-b border-brand-brown uppercase">Guide des tailles</button>
              </div>
              <div class="flex flex-wrap gap-3">
                <button 
                  *ngFor="let s of p.sizes" 
                  (click)="selectedSize.set(s)"
                  class="min-w-[50px] h-12 flex items-center justify-center border-2 font-black transition-all rounded-lg"
                  [class.bg-brand-blue]="selectedSize() === s"
                  [class.text-white]="selectedSize() === s"
                  [class.border-brand-blue]="selectedSize() === s"
                  [class.border-gray-100]="selectedSize() !== s"
                  [class.hover:border-brand-blue]="selectedSize() !== s"
                >
                  {{ s }}
                </button>
              </div>
            </div>

            <!-- Colors -->
            <div *ngIf="p.colors && p.colors.length > 0">
              <label class="block font-black text-xs tracking-widest uppercase text-brand-blue mb-4">Couleur : <span class="text-brand-brown">{{ selectedColor() || 'Choisir' }}</span></label>
              <div class="flex flex-wrap gap-4">
                <button 
                  *ngFor="let c of p.colors" 
                  (click)="selectedColor.set(c)"
                  class="w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center group"
                  [class.border-brand-blue]="selectedColor() === c"
                  [class.border-transparent]="selectedColor() !== c"
                  [title]="c"
                >
                  <span class="w-full h-full rounded-full border-2 border-white shadow-inner" [style.background-color]="getColorCode(c)"></span>
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block font-black text-xs tracking-widest uppercase text-brand-blue mb-4">Quantité</label>
              <div class="inline-flex items-center border-2 border-brand-blue rounded-xl p-1">
                <button (click)="qty.set(qty() > 1 ? qty() - 1 : 1)" class="w-10 h-10 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all rounded-lg font-black">-</button>
                <span class="w-16 text-center font-black text-lg italic tracking-tighter">{{ qty() }}</span>
                <button (click)="qty.set(qty() + 1)" class="w-10 h-10 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all rounded-lg font-black">+</button>
              </div>
            </div>
          </div>

          <button 
            (click)="addToCart()"
            [disabled]="isAdding()"
            class="group relative w-full bg-brand-blue text-white py-6 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
          >
            <div class="absolute inset-0 bg-brand-brown translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <div class="relative z-10 flex items-center justify-center space-x-4">
              <lucide-angular [name]="isAdding() ? 'loader-2' : 'shopping-bag'" class="w-6 h-6" [class.animate-spin]="isAdding()"></lucide-angular>
              <span class="font-black text-2xl tracking-tighter italic uppercase">Ajouter au panier</span>
            </div>
          </button>

          <!-- Delivery Info -->
          <div class="mt-12 grid grid-cols-2 gap-6 pt-8 border-t border-brand-blue/5">
            <div class="flex items-start space-x-3">
              <lucide-angular name="truck" class="w-5 h-5 text-brand-brown flex-shrink-0 mt-0.5"></lucide-angular>
              <div>
                <h4 class="font-bold text-[10px] uppercase tracking-widest mb-1">Livraison Offerte</h4>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Dès 100€ d'achat</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <lucide-angular name="ghost" class="w-5 h-5 text-brand-brown flex-shrink-0 mt-0.5"></lucide-angular>
              <div>
                <h4 class="font-bold text-[10px] uppercase tracking-widest mb-1">Retours Gratuits</h4>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Sous 30 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  product = signal<Product | null>(null);
  activeImage = signal<string | null>(null);
  selectedSize = signal<string | null>(null);
  selectedColor = signal<string | null>(null);
  qty = signal(1);
  isAdding = signal(false);
  readonly fallbackDescription = "Une piece d'exception concue avec passion et savoir-faire pour sublimer votre style au quotidien.";

  allImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [p.image_url, ...(p.images || [])];
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      this.productService.getProduct(id).subscribe(data => {
        this.product.set(data);
        if (data && data.image_url) this.activeImage.set(data.image_url);
        // Reset selections when product changes
        this.selectedSize.set(null);
        this.selectedColor.set(null);
        this.qty.set(1);
        this.cdr.detectChanges();
      });
    });
  }

  getColorCode(color: string): string {
    const map: Record<string, string> = {
      'Noir': '#000000',
      'Blanc': '#FFFFFF',
      'Bleu': '#2563eb',
      'Rouge': '#dc2626',
      'Vert': '#16a34a',
      'Beige': '#f5f5dc',
      'Marron': '#78350f',
      'Rose': '#db2777'
    };
    return map[color] || color;
  }

  addToCart() {
    const p = this.product();
    if (!p) return;

    // Validation
    if (p.sizes && p.sizes.length > 0 && !this.selectedSize()) {
      this.notification.error('Veuillez sélectionner une taille.');
      return;
    }
    if (p.colors && p.colors.length > 0 && !this.selectedColor()) {
      this.notification.error('Veuillez sélectionner une couleur.');
      return;
    }

    this.isAdding.set(true);
    this.cartService.addToCart(p, this.qty(), this.selectedSize() ?? undefined, this.selectedColor() ?? undefined)
      .subscribe({
        next: () => {
          this.isAdding.set(false);
          this.notification.success(`"${p.name}" ajouté avec succès !`);
        },
        error: () => this.isAdding.set(false)
      });
  }
}
