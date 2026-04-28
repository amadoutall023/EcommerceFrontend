import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LucideAngularModule } from 'lucide-angular';
import { Category, Product } from './core/models';
import { ProductService } from './core/services/product.service';

type ChatAction = 'oversize' | 'categories' | 'track-order' | 'contact' | 'menu';

type ChatMessage =
  | { role: 'bot' | 'user'; type: 'text'; content: string }
  | { role: 'bot'; type: 'options'; content: string; options: Array<{ label: string; action: ChatAction }> }
  | { role: 'bot'; type: 'products'; content: string; products: Product[] }
  | { role: 'bot'; type: 'categories'; content: string; categories: Category[] };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, NavbarComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="flex flex-col min-h-screen bg-brand-beige selection:bg-brand-brown selection:text-white font-sans antialiased text-brand-blue">
      <app-navbar></app-navbar>
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <div class="fixed bottom-24 right-3 z-40 flex flex-col items-end gap-3 sm:right-6 sm:gap-4">
        <div
          *ngIf="chatOpen()"
          class="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[2rem] border border-brand-blue/10 bg-white shadow-[0_24px_80px_rgba(8,58,88,0.22)]"
        >
          <div class="relative overflow-hidden bg-brand-blue px-5 py-4 text-white">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_40%)]"></div>
            <div class="relative flex items-start justify-between gap-3">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.28em] text-brand-beige/80">Assistant TaTrend</p>
                <h3 class="mt-1 text-lg font-black italic tracking-tight">Besoin d'aide pour acheter ?</h3>
                <p class="mt-1 text-sm text-brand-beige/85">Choisis une action rapide et je te guide.</p>
              </div>
              <button
                type="button"
                aria-label="Fermer le chatbot"
                class="rounded-full border border-white/20 p-2 text-white/90 transition hover:bg-white/10"
                (click)="toggleChat()"
              >
                <lucide-angular name="x" class="h-4 w-4"></lucide-angular>
              </button>
            </div>
          </div>

          <div #chatScroll class="max-h-[26rem] space-y-4 overflow-y-auto bg-gradient-to-b from-brand-beige/40 to-white px-4 py-4">
            <ng-container *ngFor="let message of chatMessages(); let isLast = last">
              <div *ngIf="message.type === 'text'" class="flex" [ngClass]="message.role === 'user' ? 'justify-end' : 'justify-start'">
                <div
                  class="max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm"
                  [ngClass]="message.role === 'user' ? 'bg-brand-brown text-white rounded-br-md' : 'bg-white text-brand-blue rounded-bl-md border border-brand-blue/10'"
                >
                  {{ message.content }}
                </div>
              </div>

              <div *ngIf="message.type === 'options'" class="space-y-3">
                <div class="max-w-[85%] rounded-3xl rounded-bl-md border border-brand-blue/10 bg-white px-4 py-3 text-sm leading-relaxed text-brand-blue shadow-sm">
                  {{ message.content }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    *ngFor="let option of $any(message).options"
                    type="button"
                    class="rounded-full border border-brand-blue/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
                    (click)="handleChatAction(option.action, option.label)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div *ngIf="message.type === 'products'" class="space-y-3">
                <div class="max-w-[85%] rounded-3xl rounded-bl-md border border-brand-blue/10 bg-white px-4 py-3 text-sm leading-relaxed text-brand-blue shadow-sm">
                  {{ message.content }}
                </div>
                <div class="space-y-3">
                  <button
                    *ngFor="let product of $any(message).products"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-3xl border border-brand-blue/10 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    (click)="openProduct(product.id)"
                  >
                    <img [src]="product.image_url" [alt]="product.name" class="h-16 w-16 rounded-2xl object-cover">
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-[10px] font-black uppercase tracking-[0.22em] text-brand-brown">{{ product.category_name }}</p>
                      <p class="mt-1 line-clamp-2 text-sm font-black uppercase tracking-tight text-brand-blue">{{ product.name }}</p>
                      <p class="mt-1 text-sm font-black italic text-brand-blue">{{ product.price | currency:'XOF' }}</p>
                    </div>
                    <lucide-angular name="arrow-up-right" class="h-4 w-4 text-brand-brown"></lucide-angular>
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="rounded-full border border-brand-blue/15 bg-brand-blue px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-brand-brown" (click)="handleChatAction('menu', 'Menu principal')">
                    Menu principal
                  </button>
                </div>
              </div>

              <div *ngIf="message.type === 'categories'" class="space-y-3">
                <div class="max-w-[85%] rounded-3xl rounded-bl-md border border-brand-blue/10 bg-white px-4 py-3 text-sm leading-relaxed text-brand-blue shadow-sm">
                  {{ message.content }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    *ngFor="let category of $any(message).categories"
                    type="button"
                    class="rounded-full border border-brand-blue/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
                    (click)="openCategory(category.id)"
                  >
                    {{ category.name }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="rounded-full border border-brand-blue/15 bg-brand-blue px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-brand-brown" (click)="handleChatAction('menu', 'Menu principal')">
                    Menu principal
                  </button>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le chatbot"
          class="group relative flex items-center gap-3 rounded-full bg-brand-brown px-4 py-3 text-white shadow-[0_18px_40px_rgba(166,106,68,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-brand-blue sm:px-5"
          (click)="toggleChat()"
        >
          <span *ngIf="!chatOpen()" class="absolute -top-3 right-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand-brown shadow-lg ring-4 ring-brand-beige animate-pulse">
            Live
          </span>
          <span class="hidden text-xs font-black uppercase tracking-[0.18em] sm:inline">{{ chatOpen() ? 'Fermer le chat' : 'Chat support' }}</span>
          <lucide-angular [name]="chatOpen() ? 'x' : 'message-circle'" class="h-5 w-5"></lucide-angular>
        </button>

        <div *ngIf="!chatOpen()" class="max-w-[158px] rounded-2xl rounded-br-sm border border-brand-blue/10 bg-white/95 px-3 py-2.5 text-right text-[11px] font-bold leading-snug text-brand-blue shadow-[0_10px_24px_rgba(8,58,88,0.14)] backdrop-blur-sm animate-fade-in-up sm:max-w-[220px] sm:px-4 sm:py-3 sm:text-xs sm:leading-relaxed">
          <span class="sm:hidden">Besoin d'aide ? Categories, oversize, suivi.</span>
          <span class="hidden sm:inline">Besoin d'aide ? Le chat peut te montrer les categories, les oversize et le suivi de commande.</span>
        </div>
      </div>

      <button
        *ngIf="showScrollTop()"
        type="button"
        aria-label="Retour en haut"
        class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-brown focus:ring-offset-2 focus:ring-offset-brand-beige"
        (click)="scrollToTop()"
      >
        <lucide-angular name="arrow-up" class="h-5 w-5"></lucide-angular>
      </button>
    </div>
  `
})
export class App {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  @ViewChild('chatScroll') private chatScrollContainer?: ElementRef<HTMLDivElement>;

  protected readonly title = signal('front');
  protected readonly showScrollTop = signal(false);
  protected readonly chatOpen = signal(false);
  protected readonly chatMessages = signal<ChatMessage[]>([]);

  private readonly categories = signal<Category[]>([]);
  private readonly products = signal<Product[]>([]);
  private hasLoadedChatData = false;
  private hasBootstrappedChat = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);
  }

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  protected toggleChat(): void {
    const nextState = !this.chatOpen();
    this.chatOpen.set(nextState);

    if (nextState) {
      this.ensureChatDataLoaded();

      if (!this.hasBootstrappedChat) {
        this.pushBotMainMenu();
        this.hasBootstrappedChat = true;
      }

      this.scrollChatToBottom();
    }
  }

  protected handleChatAction(action: ChatAction, label: string): void {
    this.appendMessage({ role: 'user', type: 'text', content: label });

    if (action === 'menu') {
      this.pushBotMainMenu();
      return;
    }

    if (action === 'oversize') {
      const oversizeProducts = this.products().filter(product => {
        const haystack = `${product.name} ${product.category_name} ${product.description}`.toLowerCase();
        return haystack.includes('oversize');
      }).slice(0, 4);

      if (oversizeProducts.length > 0) {
        this.appendMessage({
          role: 'bot',
          type: 'products',
          content: 'Voici une selection de t-shirts oversize que tu peux ouvrir directement.',
          products: oversizeProducts,
        });
      } else {
        this.appendMessage({ role: 'bot', type: 'text', content: 'Je n’ai pas trouve de t-shirt oversize pour le moment, mais tu peux parcourir toute la boutique.' });
        this.pushBotMainMenu();
      }

      return;
    }

    if (action === 'categories') {
      this.appendMessage({
        role: 'bot',
        type: 'categories',
        content: 'Voici les categories disponibles. Clique sur celle qui t’interesse.',
        categories: this.categories(),
      });
      return;
    }

    if (action === 'track-order') {
      this.appendMessage({
        role: 'bot',
        type: 'options',
        content: 'Pour suivre ta commande, connecte-toi puis ouvre ton historique de commandes.',
        options: [
          { label: 'Retour au menu', action: 'menu' },
          { label: 'Contacter le support', action: 'contact' },
        ],
      });
      setTimeout(() => this.router.navigate(['/orders']), 250);
      return;
    }

    if (action === 'contact') {
      this.appendMessage({
        role: 'bot',
        type: 'options',
        content: 'Tu peux contacter le service client pour une aide rapide sur WhatsApp, email ou suivi de commande.',
        options: [
          { label: 'Voir les categories', action: 'categories' },
          { label: 'Menu principal', action: 'menu' },
        ],
      });
    }
  }

  protected openProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
    this.scrollToTop();
  }

  protected openCategory(categoryId: number): void {
    this.router.navigate(['/products'], { queryParams: { category_id: categoryId } });
    this.scrollToTop();
  }

  private pushBotMainMenu(): void {
    this.appendMessage({
      role: 'bot',
      type: 'options',
      content: 'Bonjour, je peux t’aider a trouver un produit, explorer les categories ou t’orienter vers le service client.',
      options: [
        { label: 'Je veux voir les t-shirts oversize', action: 'oversize' },
        { label: 'Les categories', action: 'categories' },
        { label: 'Suivre ma commande', action: 'track-order' },
        { label: 'Contact service client', action: 'contact' },
      ],
    });
  }

  private appendMessage(message: ChatMessage): void {
    this.chatMessages.update(messages => [...messages, message]);
    this.scrollChatToBottom();
  }

  private ensureChatDataLoaded(): void {
    if (this.hasLoadedChatData) {
      return;
    }

    this.hasLoadedChatData = true;

    this.productService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });

    this.productService.getCatalog().subscribe({
      next: (data) => this.products.set(data.products),
    });
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      const container = this.chatScrollContainer?.nativeElement;
      if (!container) {
        return;
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }, 0);
  }
}
