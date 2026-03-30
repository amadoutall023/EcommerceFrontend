import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-24">
      <h1 class="text-6xl font-black italic tracking-tighter mb-16 uppercase">MES COMMANDES</h1>

      <div class="space-y-6" *ngIf="orders().length > 0; else noOrders">
        <div *ngFor="let order of orders()" class="flex flex-col border border-brand-blue/5 overflow-hidden group hover:border-brand-blue/20 transition-all shadow-sm">
          <div class="bg-white p-8 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer" (click)="toggleOrder(order.id)">
            <div class="mb-4 md:mb-0">
              <div class="flex items-center space-x-4 mb-2">
                <span class="text-brand-brown font-black tracking-widest text-xs uppercase">Réf: #ORD-{{ order.id }}</span>
                <span class="bg-brand-beige px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand-blue">{{ order.status }}</span>
              </div>
              <h3 class="text-2xl font-black italic tracking-tighter uppercase">{{ order.created_at | date:'dd MMMM yyyy' }}</h3>
            </div>

            <div class="flex items-center space-x-12">
              <div class="text-right">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Montant Total</p>
                <p class="text-3xl font-black italic tracking-tighter text-brand-blue leading-none">{{ order.total_amount | currency:'XOF' }}</p>
              </div>
              <lucide-angular [name]="expandedOrderId() === order.id ? 'chevron-up' : 'chevron-down'" class="w-6 h-6 opacity-20"></lucide-angular>
            </div>
          </div>

          <!-- Order Items detail -->
          <div *ngIf="expandedOrderId() === order.id" class="bg-brand-beige/5 p-8 border-t border-brand-blue/5 animate-fade-in-down">
            <h4 class="text-[10px] font-black uppercase tracking-widest mb-6 text-brand-brown border-b border-brand-brown/10 pb-2">Détails des articles</h4>
            <div class="space-y-6">
              <div *ngFor="let item of order.items" class="flex justify-between items-center group/item">
                <div class="flex items-center space-x-6">
                  <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img [src]="item.product_image || 'https://images.unsplash.com/photo-1523381235208-e7bd991480cc?q=80&w=200'" class="w-full h-full object-cover">
                  </div>
                  <div>
                    <h5 class="font-black italic text-lg tracking-tighter uppercase text-brand-blue">{{ item.product_name }}</h5>
                    <div class="flex items-center space-x-3 mt-1" *ngIf="item.selected_size || item.selected_color">
                      <span *ngIf="item.selected_size" class="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white px-2 py-0.5 rounded shadow-sm">
                        Taille: <span class="text-brand-blue">{{ item.selected_size }}</span>
                      </span>
                      <span *ngIf="item.selected_color" class="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white px-2 py-0.5 rounded shadow-sm">
                        Couleur: <span class="text-brand-blue">{{ item.selected_color }}</span>
                      </span>
                    </div>
                    <p class="text-xs font-bold text-brand-brown mt-2 uppercase tracking-widest">Qté: {{ item.quantity }} × {{ item.unit_price | currency:'XOF' }}</p>
                  </div>
                </div>
                <p class="font-black italic text-xl tracking-tighter text-brand-blue">{{ item.subtotal | currency:'XOF' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noOrders>
        <div class="text-center py-40 bg-white border border-dashed border-brand-blue/20">
          <lucide-angular name="history" class="w-24 h-24 mx-auto text-brand-blue/10 mb-8"></lucide-angular>
          <h2 class="text-3xl font-black italic tracking-tighter opacity-30 mb-8">AUCUNE COMMANDE PASSÉE</h2>
          <a routerLink="/products" class="inline-block bg-brand-blue text-white px-12 py-5 font-black text-xl italic tracking-tighter hover:bg-brand-brown transition-all uppercase">
            Visiter la boutique
          </a>
        </div>
      </ng-template>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  expandedOrderId = signal<number | null>(null);

  ngOnInit() {
    this.orderService.getHistory().subscribe(data => {
      this.orders.set(data);
    });
  }

  toggleOrder(id: number) {
    this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
  }
}
