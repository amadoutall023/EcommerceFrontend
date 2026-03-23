import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="mb-12">
        <h1 class="text-6xl font-black italic tracking-tighter uppercase mb-2">GESTION COMMANDES</h1>
        <p class="text-brand-brown font-bold text-xs tracking-widest uppercase">Suivi et Expédition</p>
      </div>

      <div class="bg-white border border-brand-blue/5 overflow-hidden">
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
              </td>
              <td class="px-6 py-4 text-gray-500 text-sm">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-6 py-4 font-black italic">{{ order.total_amount | currency:'XOF' }}</td>
              <td class="px-6 py-4">
                <span 
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': order.status === 'pending',
                    'bg-green-100 text-green-800': order.status === 'paid',
                    'bg-blue-100 text-blue-800': order.status === 'shipped',
                    'bg-gray-100 text-gray-800': order.status === 'delivered'
                  }"
                  class="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                >
                  {{ order.status }}
                </span>
                <lucide-angular [name]="selectedOrderId() === order.id ? 'chevron-up' : 'chevron-down'" class="w-3 h-3 ml-2 inline opacity-20"></lucide-angular>
              </td>
              <td class="px-6 py-4 text-right" (click)="$event.stopPropagation()">
                <select 
                  (change)="updateStatus(order.id, $any($event.target).value)"
                  class="bg-brand-beige/30 border-none text-[10px] font-black uppercase tracking-widest px-2 py-1 outline-none focus:ring-1 focus:ring-brand-blue"
                >
                  <option value="" disabled selected>Modifier</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="shipped">Expédié</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
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
            <p class="text-2xl font-black italic tracking-tighter opacity-20 uppercase">Aucune commande trouvée</p>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  orders = signal<any[]>([]);
  selectedOrderId = signal<number | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.adminService.getOrders().subscribe(res => {
      this.orders.set(res.data);
    });
  }

  updateStatus(id: number, status: string) {
    this.adminService.updateOrderStatus(id, status).subscribe(() => {
      this.loadOrders();
    });
  }
}
