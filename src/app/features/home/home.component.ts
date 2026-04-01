import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Category, Product } from '../../core/models';
import { LucideAngularModule } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  template: `
    <!-- Hero Section -->
    <div class="relative bg-brand-blue min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      <!-- Hero Background Image (Circular & Left) -->
      <div class="absolute inset-y-0 left-0 w-full md:w-1/2 flex items-center justify-center md:justify-start px-4 md:px-8 md:pl-24 z-0">
        <div class="w-48 h-48 md:w-72 md:h-72 lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden border-[8px] md:border-[12px] border-white/5 shadow-[0_0_30px_md:0_50px_rgba(0,0,0,0.3)] animate-fade-in group">
          <img src="gg.jpg" alt="Hero Background" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
        </div>
      </div>

      <!-- Subtle Overlay for Mobile Readability -->
      <div class="absolute inset-0 bg-brand-blue/40 md:hidden z-10"></div>

      <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center md:items-end text-center md:text-right py-12 md:py-0">
        <h2 class="text-brand-beige text-xs md:text-sm font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase mb-4 md:mb-6 animate-fade-in-up">Collection Printemps 2026</h2>
        
        <h1 class="text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter mb-6 md:mb-8 animate-fade-in-up animation-delay-200 leading-none">
          STYLE<br>
          <span class="text-brand-brown">SANS</span><br>
          LIMITE
        </h1>

        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6 animate-fade-in-up animation-delay-600">
          <a routerLink="/products" class="group relative px-8 md:px-10 py-3 md:py-5 bg-brand-brown text-white font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-brown/50 hover:-translate-y-1">
            <span class="relative z-10 uppercase text-sm tracking-wider">Acheter Maintenant teh tapoter </span>
            <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </a>
          
          <a routerLink="/products" class="group px-8 md:px-10 py-3 md:py-5 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white hover:text-brand-blue hover:border-white transition-all duration-300 text-sm uppercase tracking-wider">
            <span class="uppercase tracking-wider">Voir Catalogue</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Featured Categories -->
    <section id="categories" class="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h3 class="text-brand-brown font-bold tracking-widest uppercase text-sm mb-2">Explorez</h3>
          <h2 class="text-4xl font-black italic tracking-tighter text-brand-blue uppercase">NOS CATÉGORIES</h2>
        </div>
        <a routerLink="/products" class="text-brand-brown font-bold border-b-2 border-brand-brown pb-1 hover:text-brand-blue hover:border-brand-blue transition-all">Tout voir</a>
      </div>

      <div *ngIf="isLoadingCategories()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div *ngFor="let item of skeletonCategories" class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-blue/[0.04]">
          <div class="absolute inset-0 animate-pulse bg-gradient-to-br from-brand-blue/10 via-brand-beige/30 to-brand-brown/10"></div>
          <div class="absolute inset-x-0 bottom-0 p-8">
            <div class="mb-3 h-3 w-20 rounded-full bg-white/70"></div>
            <div class="h-10 w-32 rounded-2xl bg-white/80"></div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoadingCategories() && categories().length === 0" class="rounded-3xl border border-brand-blue/10 bg-brand-beige/30 px-6 py-10 text-center">
        <p class="text-sm font-bold uppercase tracking-[0.24em] text-brand-brown">Les catégories arrivent bientôt.</p>
      </div>

      <div *ngIf="!isLoadingCategories() && categories().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div *ngFor="let cat of categories(); let i = index" class="group relative aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up" [style.animation-delay]="i * 100 + 'ms'" [routerLink]="['/products']" [queryParams]="{category_id: cat.id}">
          <!-- Image Layer -->
          <img [src]="cat.image_url" [alt]="cat.name" loading="eager" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
          
          <!-- Subtle Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
          
          <!-- Content Layer -->
          <div class="absolute inset-0 p-8 flex flex-col justify-end">
            <div class="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <p class="text-brand-beige text-[10px] font-bold tracking-[0.3em] mb-2 uppercase opacity-90">Collection</p>
              <h4 class="text-white text-3xl font-black tracking-tighter uppercase leading-none mb-4">{{ cat.name }}</h4>
              
              <div class="flex items-center text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span>Explorer</span>
                <lucide-angular name="arrow-right" class="w-4 h-4 ml-2"></lucide-angular>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Products Section -->
    <section id="recent-products" class="max-w-7xl mx-auto px-4 py-12 md:py-24 border-t border-gray-100">
      <div class="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-16 space-y-4 md:space-y-0 text-center md:text-left">
        <div>
          <h3 class="text-brand-brown font-bold tracking-widest uppercase text-sm mb-2">Les Nouveautés</h3>
          <h2 class="text-4xl md:text-5xl font-black italic tracking-tighter text-brand-blue uppercase">FRAÎCHEMENT DÉBARQUÉS</h2>
        </div>
        <a routerLink="/products" class="group flex items-center space-x-2 text-brand-blue font-black uppercase tracking-widest text-xs border-b-2 border-brand-blue pb-1 hover:text-brand-brown hover:border-brand-brown transition-all">
          <span>Voir toute la boutique</span>
          <lucide-angular name="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></lucide-angular>
        </a>
      </div>

      <div *ngIf="isLoadingProducts()" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
        <div *ngFor="let item of skeletonProducts" class="animate-pulse">
          <div class="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-blue/[0.04] mb-6">
            <div class="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-brand-beige/30 to-brand-brown/10"></div>
            <div class="absolute left-4 top-4 h-6 w-14 rounded-full bg-white/80"></div>
          </div>
          <div class="text-center md:text-left">
            <div class="mb-2 h-3 w-20 rounded-full bg-brand-brown/20"></div>
            <div class="mb-3 h-6 w-32 rounded-full bg-brand-blue/10"></div>
            <div class="h-6 w-24 rounded-full bg-brand-blue/15"></div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoadingProducts() && recentProducts().length === 0" class="rounded-3xl border border-brand-blue/10 bg-brand-beige/30 px-6 py-10 text-center">
        <p class="text-sm font-bold uppercase tracking-[0.24em] text-brand-brown">Aucun produit à afficher pour le moment.</p>
      </div>

      <div *ngIf="!isLoadingProducts() && recentProducts().length > 0" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
        <div *ngFor="let product of recentProducts(); let i = index" 
             class="group cursor-pointer animate-fade-in-up" 
             [style.animation-delay]="i * 100 + 'ms'"
             [routerLink]="['/products', product.id]">
          
          <!-- Product Image Wrapper -->
          <div class="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 mb-6">
            <img [src]="product.image_url" [alt]="product.name" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            
            <!-- Quick Link / Badge -->
            <div class="absolute top-4 left-4">
              <span *ngIf="product.original_price" class="bg-brand-brown text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full shadow-lg">
                -{{ ((product.original_price - product.price) / product.original_price * 100) | number:'1.0-0' }}%
              </span>
              <span *ngIf="!product.original_price" class="bg-brand-blue text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full">New</span>
            </div>

            <!-- Hover Actions Overlay -->
            <div class="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div class="bg-white text-brand-blue p-4 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <lucide-angular name="eye" class="w-6 h-6"></lucide-angular>
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="text-center md:text-left">
            <p class="text-[10px] font-black text-brand-brown uppercase tracking-widest mb-1">{{ product.category_name }}</p>
            <h4 class="text-lg font-bold text-brand-blue leading-tight mb-2 group-hover:text-brand-brown transition-colors uppercase tracking-tighter">{{ product.name }}</h4>
            <div class="flex items-center space-x-3">
              <p class="text-xl font-black italic text-brand-blue tracking-tighter">{{ product.price | currency:'XOF' }}</p>
              <p *ngIf="product.original_price" class="text-xs text-gray-400 line-through font-bold decoration-brand-brown/30">{{ product.original_price | currency:'XOF' }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Call to Action Section -->
    <section id="movement" class="relative py-16 md:py-32 overflow-hidden">
      <div class="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-brand-blue/90 mix-blend-multiply"></div>
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-white text-3xl md:text-5xl lg:text-7xl font-black italic tracking-tighter mb-6 md:mb-8 animate-fade-in">REJOIGNEZ LE MOUVEMENT</h2>
        <p class="text-brand-beige text-base md:text-xl lg:text-2xl font-light mb-8 md:mb-12 opacity-80 leading-relaxed">
          Inscrivez-vous pour recevoir nos dernières collections en avant-première et des offres exclusives réservées à notre communauté.
        </p>
        <div class="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
          <div class="w-full max-w-xs sm:max-w-md bg-white/10 backdrop-blur-md p-1 flex border border-white/20 rounded-full">
            <input 
              type="email" 
              [(ngModel)]="subscribeEmail"
              placeholder="votre@email.com" 
              class="flex-grow bg-transparent px-4 md:px-6 py-3 md:py-4 text-white outline-none placeholder:text-white/50 font-bold text-sm"
            >
            <button 
              (click)="onSubscribe()"
              [disabled]="isSubscribing()"
              class="bg-brand-brown text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-blue transition-all duration-300 disabled:opacity-50"
            >
              {{ isSubscribing() ? '...' : "S'inscrire" }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="bg-brand-beige/30 py-16 md:py-32 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12 md:mb-20">
          <h3 class="text-brand-brown font-bold tracking-[0.4em] uppercase text-xs mb-4">La voix de nos clients</h3>
          <h2 class="text-3xl md:text-5xl font-black italic tracking-tighter text-brand-blue uppercase">ILS NOUS FONT CONFIANCE</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div class="bg-white p-6 md:p-12 shadow-xl hover:-translate-y-2 transition-transform duration-500 relative group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <lucide-angular name="quote" class="w-20 h-20 text-brand-blue"></lucide-angular>
            </div>
            <div class="flex space-x-1 mb-6 text-orange-400">
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
            </div>
            <p class="text-gray-600 italic leading-relaxed text-lg mb-8">
              "La qualité des t-shirts est exceptionnelle. La coupe est parfaite et le tissu est d'une douceur rare. Enfin une marque qui respecte ses promesses."
            </p>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center font-black text-brand-blue">JD</div>
              <div>
                <h4 class="font-black italic text-brand-blue uppercase tracking-tighter">EL hadji mbaye Tall</h4>
                <p class="text-[10px] font-bold text-brand-brown uppercase tracking-widest">Client Fidèle</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 md:p-12 shadow-xl hover:-translate-y-2 transition-transform duration-500 relative group md:mt-12">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <lucide-angular name="quote" class="w-20 h-20 text-brand-blue"></lucide-angular>
            </div>
            <div class="flex space-x-1 mb-6 text-orange-400">
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
            </div>
            <p class="text-gray-600 italic leading-relaxed text-lg mb-8">
              "Le service client est au top. J'ai eu un souci de taille et l'échange a été fait en 48h. Une expérience d'achat vraiment premium."
            </p>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-brand-brown/10 flex items-center justify-center font-black text-brand-brown">SM</div>
              <div>
                <h4 class="font-black italic text-brand-blue uppercase tracking-tighter">Sophie Diaw</h4>
                <p class="text-[10px] font-bold text-brand-brown uppercase tracking-widest">Acheteur vérifié</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 md:p-12 shadow-xl hover:-translate-y-2 transition-transform duration-500 relative group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <lucide-angular name="quote" class="w-20 h-20 text-brand-blue"></lucide-angular>
            </div>
            <div class="flex space-x-1 mb-6 text-orange-400">
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
              <lucide-angular name="star" class="w-4 h-4 fill-current"></lucide-angular>
            </div>
            <p class="text-gray-600 italic leading-relaxed text-lg mb-8">
              "J'adore tes t-shirt unique . On sent une vraie passion derrière le produit. Le packaging est aussi soigné que les vêtements."
            </p>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center font-black text-brand-blue">ML</div>
              <div>
                <h4 class="font-black italic text-brand-blue uppercase tracking-tighter">Ibou Fall</h4>
                <p class="text-[10px] font-bold text-brand-brown uppercase tracking-widest">Fashion Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Localisation Section -->
    <section id="localisation" class="py-16 md:py-24 bg-brand-blue">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h3 class="text-brand-beige font-bold tracking-[0.4em] uppercase text-xs mb-4">Tapoter len live bi Venez nous rendre visite</h3>
          <h2 class="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">NOTRE BOUTIQUE</h2>
        </div>

        <div class="max-w-2xl mx-auto">
          <!-- Zac Mbao Cite Sonatel Location -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-6 md:p-8">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                  <lucide-angular name="pin" class="w-6 h-6 text-white"></lucide-angular>
                </div>
                <div>
                  <h4 class="font-black text-brand-blue uppercase tracking-tighter text-xl">Zac Mbao - Cité Sonatel</h4>
                  <p class="text-brand-brown font-bold text-xs tracking-widest uppercase">Dakar, Sénégal</p>
                </div>
              </div>
              <p class="text-gray-600 mb-4">
                Rendez-nous visite dans notre boutique Zac Mbao (Cité Sonatel). Nous sommes ouverts du lundi au samedi pour vous accueillir et vous conseiller.
              </p>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <div class="flex items-center space-x-2">
                  <lucide-angular name="clock" class="w-4 h-4"></lucide-angular>
                  <span>Lun-Dim: 9h-20h</span>
                </div>
                <div class="flex items-center space-x-2">
                  <lucide-angular name="phone" class="w-4 h-4"></lucide-angular>
                  <span>+221 78 454 11 51</span>
                </div>
              </div>
            </div>
            <div class="h-80 w-full">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.224539507618!2d-17.462069924840453!3d14.757716535692857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec10d9d3c2f8c8b%3A0x1234567890abcdef!2sZac%20Mbao%2C%20Dakar%2C%20S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2s!4v1700000000000!5m2!1sfr!2s" 
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
                title="Zac Mbao - TaTrend">
              </iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private subscriptionService = inject(SubscriptionService);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  categories = signal<Category[]>([]);
  recentProducts = signal<Product[]>([]);
  isLoadingCategories = signal(true);
  isLoadingProducts = signal(true);
  subscribeEmail = '';
  isSubscribing = signal(false);
  skeletonCategories = Array.from({ length: 4 });
  skeletonProducts = Array.from({ length: 8 });

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.isLoadingCategories.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCategories.set(false);
        this.cdr.detectChanges();
      }
    });

    this.productService.getCatalog().subscribe({
      next: (res) => {
        this.recentProducts.set(res.products.slice(0, 8));
        this.isLoadingProducts.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProducts.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  onSubscribe() {
    if (!this.subscribeEmail || !this.subscribeEmail.includes('@')) {
      return;
    }

    this.isSubscribing.set(true);
    this.subscriptionService.subscribe(this.subscribeEmail).subscribe({
      next: (res) => {
        this.isSubscribing.set(false);
        this.subscribeEmail = '';
        this.notification.success(res.message);
      },
      error: () => {
        this.isSubscribing.set(false);
        this.notification.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    });
  }
}
