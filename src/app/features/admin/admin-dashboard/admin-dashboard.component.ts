import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h1 class="text-6xl font-black italic tracking-tighter uppercase mb-2">TABLEAU DE BORD</h1>
          <p class="text-brand-brown font-bold text-xs tracking-widest uppercase">Gestion Administrative</p>
        </div>
        <div class="flex space-x-4">
           <a routerLink="orders" class="bg-brand-blue text-white px-6 py-3 font-bold text-sm tracking-widest uppercase hover:bg-brand-brown transition-colors">Commandes</a>
           <a routerLink="inventory" class="border-2 border-brand-blue text-brand-blue px-6 py-3 font-bold text-sm tracking-widest uppercase hover:bg-brand-blue hover:text-white transition-colors">Inventaire</a>
           <a routerLink="subscribers" class="border-2 border-brand-brown text-brand-brown px-6 py-3 font-bold text-sm tracking-widest uppercase hover:bg-brand-brown hover:text-white transition-colors">Abonnés</a>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16" *ngIf="stats() as s">
        <div class="bg-white p-8 border border-brand-blue/5 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ventes Totales</p>
          <p class="text-4xl font-black italic tracking-tighter text-brand-blue">{{ s.total_sales | currency:'XOF' }}</p>
        </div>
        <div class="bg-white p-8 border border-brand-blue/5 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Commandes</p>
          <p class="text-4xl font-black italic tracking-tighter text-brand-blue">{{ s.orders_count }}</p>
        </div>
        <div class="bg-white p-8 border border-brand-blue/5 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">En attente</p>
          <p class="text-4xl font-black italic tracking-tighter text-brand-brown">{{ s.pending_orders }}</p>
        </div>
        <div class="bg-white p-8 border border-brand-blue/5 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Clients</p>
          <p class="text-4xl font-black italic tracking-tighter text-brand-blue">{{ s.total_users }}</p>
        </div>
      </div>

      <!-- Quick Actions / Last Orders teaser -->
      <div class="bg-brand-blue text-white p-12 relative overflow-hidden">
        <div class="relative z-10 max-w-2xl">
          <h2 class="text-3xl font-black italic tracking-tighter mb-6 uppercase">Gestion de l'inventaire</h2>
          <p class="text-gray-300 text-lg mb-8">Ajoutez de nouveaux produits, mettez à jour les stocks et gérez vos catégories en quelques clics.</p>
          <a routerLink="inventory" class="inline-block bg-brand-beige text-brand-blue px-10 py-4 font-black text-lg italic tracking-tighter hover:bg-white transition-colors uppercase">
            Accéder à l'inventaire
          </a>
        </div>
        <!-- Abstract Decor -->
        <div class="absolute right-0 top-0 h-full w-1/3 bg-brand-brown/20 skew-x-12 translate-x-1/2"></div>
      </div>
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
