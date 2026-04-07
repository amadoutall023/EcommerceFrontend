import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
    selector: 'app-admin-subscribers',
    standalone: true,
    imports: [CommonModule, BackButtonComponent],
    template: `
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
            <app-back-button fallbackUrl="/admin" label="Retour dashboard" class="mb-6 block"></app-back-button>
            <h1 class="text-2xl font-bold mb-6">Abonnés à la newsletter</h1>
            
            @if (loading()) {
                <div class="text-center py-8">
                    <p class="text-gray-500">Chargement...</p>
                </div>
            } @else if (subscribers().length === 0) {
                <div class="text-center py-8">
                    <p class="text-gray-500">Aucun abonné pour le moment.</p>
                </div>
            } @else {
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date d'inscription
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @for (subscriber of subscribers(); track subscriber.id) {
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ subscriber.email }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span [class]="subscriber.is_active 
                                            ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
                                            : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'">
                                            {{ subscriber.is_active ? 'Actif' : 'Inactif' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ subscriber.created_at | date:'dd/MM/yyyy HH:mm' }}
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-4 text-sm text-gray-600">
                    Total: {{ subscribers().length }} abonné(s)
                </div>
            }
        </div>
    `
})
export class AdminSubscribersComponent implements OnInit {
    private adminService = inject(AdminService);

    subscribers = signal<any[]>([]);
    loading = signal(true);

    ngOnInit() {
        this.loadSubscribers();
    }

    loadSubscribers() {
        this.loading.set(true);
        this.adminService.getSubscribers().subscribe({
            next: (res) => {
                this.subscribers.set(res.data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading subscribers:', err);
                this.loading.set(false);
            }
        });
    }
}
