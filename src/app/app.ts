import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="flex flex-col min-h-screen bg-brand-beige selection:bg-brand-brown selection:text-white font-sans antialiased text-brand-blue">
      <app-navbar></app-navbar>
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

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
  protected readonly title = signal('front');
  protected readonly showScrollTop = signal(false);

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
}
