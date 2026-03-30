import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, OrderStatus } from '../../../core/services/admin.service';
import { Order } from '../../../core/models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
      <div class="mb-8">
        <p class="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-brown sm:text-xs">Suivi et Expedition</p>
        <h1 class="text-3xl font-black italic tracking-tighter uppercase sm:text-5xl lg:text-6xl">Gestion Commandes</h1>
      </div>

      <div class="space-y-4 lg:hidden">
        <div
          *ngFor="let order of orders()"
          class="border border-brand-blue/10 bg-white p-4 shadow-sm"
        >
          <button
            type="button"
            class="w-full text-left"
            (click)="selectedOrderId.set(selectedOrderId() === order.id ? null : order.id)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-lg font-black italic tracking-tighter">#ORD-{{ order.id }}</p>
                <p class="mt-1 text-xs font-black uppercase tracking-[0.2em] text-brand-brown">{{ order.customer_name || ('Client #' + order.user_id) }}</p>
                <p *ngIf="order.customer_phone" class="mt-1 text-xs font-semibold text-gray-400">{{ order.customer_phone }}</p>
              </div>
              <lucide-angular [name]="selectedOrderId() === order.id ? 'chevron-up' : 'chevron-down'" class="mt-1 h-4 w-4 flex-shrink-0 opacity-30"></lucide-angular>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="bg-brand-beige/25 p-3">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">Date</p>
                <p class="mt-2 text-sm font-bold text-brand-blue">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="bg-brand-beige/25 p-3">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">Total</p>
                <p class="mt-2 text-sm font-black italic text-brand-blue">{{ order.total_amount | currency:'XOF' }}</p>
              </div>
            </div>
          </button>

          <div class="mt-4 flex items-center justify-between gap-3">
            <span
              [ngClass]="statusClasses(order.status)"
              class="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
            >
              {{ statusLabel(order.status) }}
            </span>

            <select
              (change)="updateStatus(order.id, $any($event.target).value)"
              [value]="order.status"
              class="min-w-0 bg-brand-beige/30 px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="pending">En attente</option>
              <option value="paid">Payee</option>
              <option value="shipped">Expediee</option>
              <option value="delivered">Livree</option>
              <option value="cancelled">Annulee</option>
            </select>
          </div>

          <div *ngIf="selectedOrderId() === order.id" class="mt-5 space-y-5 border-t border-brand-blue/10 pt-5">
            <div>
              <h4 class="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-brown">Produits Commandes</h4>
              <div class="space-y-3">
                  <div *ngFor="let item of order.items" class="border-b border-brand-blue/5 pb-3">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-bold">{{ item.product_name }}</p>
                      <p class="mt-1 text-[10px] text-gray-400">Ref #{{ item.product_id }} x {{ item.quantity }}</p>
                    </div>
                    <p class="text-sm font-black italic">{{ item.unit_price * item.quantity | currency:'XOF' }}</p>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2" *ngIf="item.selected_size || item.selected_color">
                    <span *ngIf="item.selected_size" class="bg-gray-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-gray-500">
                      T: {{ item.selected_size }}
                    </span>
                    <span *ngIf="item.selected_color" class="bg-gray-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-gray-500">
                      C: {{ item.selected_color }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="border border-brand-blue/5 bg-brand-beige/10 p-4">
              <div class="flex justify-between text-xs font-bold uppercase text-gray-500">
                <span>Total Final</span>
                <span class="text-base font-black italic text-brand-blue">{{ order.total_amount | currency:'XOF' }}</span>
              </div>
            </div>

            <div *ngIf="order.customer_phone" class="border border-brand-blue/5 bg-white p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.24em] text-brand-brown">Contact Client</p>
              <p class="mt-2 text-base font-black italic tracking-tighter text-brand-blue">{{ order.customer_phone }}</p>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <a
                  [href]="'tel:' + order.customer_phone"
                  class="border border-brand-blue px-4 py-3 text-center text-xs font-black uppercase tracking-[0.22em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
                >
                  Appeler
                </a>
                <a
                  [href]="buildWhatsappLink(order)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="border border-green-500 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.22em] text-green-600 transition-colors hover:bg-green-500 hover:text-white"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="orders().length === 0" class="py-16 text-center">
          <p class="text-xl font-black italic uppercase tracking-tighter opacity-20">Aucune commande trouvee</p>
        </div>
      </div>

      <div class="hidden overflow-hidden border border-brand-blue/5 bg-white lg:block">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-brand-blue text-white uppercase text-[10px] tracking-[0.2em] font-black">
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Client</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Total</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-blue/5">
            <ng-container *ngFor="let order of orders()">
            <tr class="hover:bg-brand-beige/20 transition-colors group cursor-pointer" (click)="selectedOrderId.set(selectedOrderId() === order.id ? null : order.id)">
              <td class="px-6 py-4 font-black italic tracking-tighter">#ORD-{{ order.id }}</td>
              <td class="px-6 py-4">
                <p class="font-bold uppercase text-xs">{{ order.customer_name || ('Client #' + order.user_id) }}</p>
                <p *ngIf="order.customer_phone" class="text-[10px] text-gray-400 font-bold mt-1">{{ order.customer_phone }}</p>
                <div *ngIf="order.customer_phone" class="mt-3 flex flex-wrap gap-2">
                  <a
                    [href]="'tel:' + order.customer_phone"
                    class="border border-brand-blue px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
                  >
                    Appeler
                  </a>
                  <a
                    [href]="buildWhatsappLink(order)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="border border-green-500 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-green-600 transition-colors hover:bg-green-500 hover:text-white"
                  >
                    WhatsApp
                  </a>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-500 text-sm">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-6 py-4 font-black italic">{{ order.total_amount | currency:'XOF' }}</td>
              <td class="px-6 py-4">
                <span 
                  [ngClass]="statusClasses(order.status)"
                  class="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                >
                  {{ statusLabel(order.status) }}
                </span>
                <lucide-angular [name]="selectedOrderId() === order.id ? 'chevron-up' : 'chevron-down'" class="w-3 h-3 ml-2 inline opacity-20"></lucide-angular>
              </td>
              <td class="px-6 py-4 text-right" (click)="$event.stopPropagation()">
                <select 
                  (change)="updateStatus(order.id, $any($event.target).value)"
                  [value]="order.status"
                  class="bg-brand-beige/30 border-none text-[10px] font-black uppercase tracking-widest px-2 py-1 outline-none focus:ring-1 focus:ring-brand-blue"
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payee</option>
                  <option value="shipped">Expediee</option>
                  <option value="delivered">Livree</option>
                  <option value="cancelled">Annulee</option>
                </select>
              </td>
            </tr>
            <!-- Order Details Expanded -->
            <tr *ngIf="selectedOrderId() === order.id" class="bg-brand-beige/10">
              <td colspan="6" class="px-12 py-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-brand-brown">Produits Commandés</h4>
                    <div class="space-y-4">
                      <div *ngFor="let item of order.items" class="flex justify-between items-center border-b border-brand-blue/5 pb-2">
                        <div>
                          <p class="font-bold text-sm">{{ item.product_name }}</p>
                          <div class="flex items-center space-x-2 mt-1" *ngIf="item.selected_size || item.selected_color">
                            <span *ngIf="item.selected_size" class="text-[8px] font-black uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                              T: {{ item.selected_size }}
                            </span>
                            <span *ngIf="item.selected_color" class="text-[8px] font-black uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                              C: {{ item.selected_color }}
                            </span>
                          </div>
                          <p class="text-[10px] text-gray-400 mt-1">Réf #{{ item.product_id }} × {{ item.quantity }}</p>
                        </div>
                        <p class="font-black italic text-sm">{{ item.unit_price * item.quantity | currency:'XOF' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white p-6 border border-brand-blue/5">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-brand-brown">Résumé</h4>
                    <div class="flex justify-between mb-2">
                      <span class="text-xs uppercase font-bold text-gray-400">Total Articles</span>
                      <span class="font-bold">{{ order.total_amount | currency:'XOF' }}</span>
                    </div>
                    <div class="flex justify-between border-t border-brand-blue/10 pt-2 mt-2">
                      <span class="text-xs uppercase font-black">Total Final</span>
                      <span class="font-black text-xl italic tracking-tighter">{{ order.total_amount | currency:'XOF' }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </ng-container>
        </tbody>
        </table>

        <div *ngIf="orders().length === 0" class="py-24 text-center">
            <p class="text-2xl font-black italic tracking-tighter opacity-20 uppercase">Aucune commande trouvee</p>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  orders = signal<Order[]>([]);
  selectedOrderId = signal<number | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.adminService.getOrders().subscribe(res => {
      this.orders.set(res.data);
    });
  }

  updateStatus(id: number, status: OrderStatus) {
    if (!status) {
      return;
    }

    const current = this.orders().find(order => order.id === id)?.status;
    if (current === status) {
      return;
    }

    this.adminService.updateOrderStatus(id, status).subscribe(() => {
      this.loadOrders();
    });
  }

  buildWhatsappLink(order: { id: number; customer_name?: string | null; customer_phone?: string | null; status: string }): string {
    const name = order.customer_name?.trim() || `client #${order.id}`;
    const message = encodeURIComponent(
      `Bonjour ${name}, ici l'equipe TaTrend. Nous vous contactons au sujet de votre commande #ORD-${order.id} actuellement "${this.statusLabel(order.status)}".`
    );

    return `https://wa.me/${this.formatWhatsappNumber(order.customer_phone ?? '')}?text=${message}`;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payee',
      shipped: 'Expediee',
      delivered: 'Livree',
      cancelled: 'Annulee',
      confirmed: 'Confirmee',
    };

    return labels[status] ?? status;
  }

  statusClasses(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-emerald-100 text-emerald-800',
      confirmed: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return classes[status] ?? 'bg-gray-100 text-gray-800';
  }

  formatWhatsappNumber(phone: string): string {
    const normalized = phone.replace(/\D/g, '');

    if (normalized.startsWith('221')) {
      return normalized;
    }

    return `221${normalized}`;
  }
}
