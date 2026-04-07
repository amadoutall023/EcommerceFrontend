import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { LucideAngularModule } from 'lucide-angular';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, BackButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
      <app-back-button fallbackUrl="/" label="Retour accueil" class="mb-6 block"></app-back-button>
      <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-brown sm:text-xs">Gestion Administrative</p>
          <h1 class="text-3xl font-black italic tracking-tighter uppercase leading-none sm:text-5xl lg:text-6xl">Tableau De Bord</h1>
          <p class="mt-4 max-w-md text-sm font-medium text-brand-blue/70 sm:text-base">
            Suivez l'activite de la boutique, accedez rapidement aux modules cles et gardez le controle depuis mobile comme desktop.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[34rem]">
           <a
             routerLink="orders"
             class="rounded-none bg-brand-blue px-5 py-4 text-center text-xs font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-brand-brown sm:text-sm"
           >
             Commandes
           </a>
           <a
             routerLink="inventory"
             class="rounded-none border-2 border-brand-blue px-5 py-4 text-center text-xs font-black uppercase tracking-[0.22em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white sm:text-sm"
           >
             Inventaire
           </a>
           <a
             routerLink="subscribers"
             class="rounded-none border-2 border-brand-brown px-5 py-4 text-center text-xs font-black uppercase tracking-[0.22em] text-brand-brown transition-colors hover:bg-brand-brown hover:text-white sm:text-sm"
           >
             Abonnes
           </a>
        </div>
      </div>

      <ng-container *ngIf="stats() as s">
        <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 sm:mb-16">
          <div class="border border-brand-blue/5 bg-white p-5 shadow-sm sm:p-7">
            <p class="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 sm:text-xs">Ventes Totales</p>
            <p class="text-2xl font-black italic tracking-tighter text-brand-blue sm:text-4xl">{{ s.total_sales | currency:'XOF' }}</p>
          </div>
          <div class="border border-brand-blue/5 bg-white p-5 shadow-sm sm:p-7">
            <p class="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 sm:text-xs">Commandes</p>
            <p class="text-2xl font-black italic tracking-tighter text-brand-blue sm:text-4xl">{{ s.orders_count }}</p>
          </div>
          <div class="border border-brand-blue/5 bg-white p-5 shadow-sm sm:p-7">
            <p class="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 sm:text-xs">En Attente</p>
            <p class="text-2xl font-black italic tracking-tighter text-brand-brown sm:text-4xl">{{ s.pending_orders }}</p>
          </div>
          <div class="border border-brand-blue/5 bg-white p-5 shadow-sm sm:p-7">
            <p class="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 sm:text-xs">Clients</p>
            <p class="text-2xl font-black italic tracking-tighter text-brand-blue sm:text-4xl">{{ s.total_users }}</p>
          </div>
        </div>

        <div class="relative overflow-hidden bg-brand-blue px-5 py-6 text-white sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div class="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:items-end">
            <div class="max-w-2xl">
              <p class="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-beige/70">Action Rapide</p>
              <h2 class="mb-4 text-2xl font-black italic tracking-tighter uppercase sm:text-3xl lg:text-4xl">Gestion De L'inventaire</h2>
              <p class="mb-6 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                Ajoutez de nouveaux produits, mettez a jour les stocks et gerez les categories en quelques clics depuis une interface compacte et efficace.
              </p>
              <a
                routerLink="inventory"
                class="inline-block w-full bg-brand-beige px-6 py-4 text-center text-base font-black italic uppercase tracking-tighter text-brand-blue transition-colors hover:bg-white sm:w-auto sm:px-10"
              >
                Acceder a l'inventaire
              </a>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:max-w-sm">
              <div class="border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p class="text-[10px] font-black uppercase tracking-[0.28em] text-brand-beige/70">Commandes</p>
                <p class="mt-3 text-2xl font-black italic tracking-tighter">{{ s.orders_count }}</p>
              </div>
              <div class="border border-white/10 bg-brand-brown/30 p-4 backdrop-blur-sm">
                <p class="text-[10px] font-black uppercase tracking-[0.28em] text-brand-beige/70">Clients</p>
                <p class="mt-3 text-2xl font-black italic tracking-tighter">{{ s.total_users }}</p>
              </div>
            </div>
          </div>

          <div class="absolute -right-10 top-0 h-full w-24 bg-brand-brown/25 sm:w-40 lg:w-56"></div>
          <div class="absolute bottom-0 right-8 h-24 w-24 rounded-full border border-white/10 sm:h-36 sm:w-36"></div>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);

  ngOnInit() {
    this.adminService.getStats().subscribe(res => {
      this.stats.set(res.data);
    });
  }
}
