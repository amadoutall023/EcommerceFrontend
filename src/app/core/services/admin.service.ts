import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, Order, Category } from '../models';

export interface AdminStats {
    total_sales: number;
    orders_count: number;
    pending_orders: number;
    total_users: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    getStats() {
        return this.http.get<{ data: AdminStats }>(`${this.apiUrl}/stats`);
    }

    getOrders() {
        return this.http.get<{ data: any[] }>(`${this.apiUrl}/orders`);
    }

    updateOrderStatus(orderId: number, status: string) {
        return this.http.put(`${this.apiUrl}/orders/${orderId}/status`, { status });
    }

    createProduct(product: FormData) {
        return this.http.post<{ data: Product }>(`${this.apiUrl}/products`, product);
    }

    updateProduct(id: number, product: FormData) {
        // Laravel sometimes has issues with PUT and FormData, using POST with _method=PUT is safer
        product.append('_method', 'PUT');
        return this.http.post<{ data: Product }>(`${this.apiUrl}/products/${id}`, product);
    }

    deleteProduct(id: number) {
        return this.http.delete(`${this.apiUrl}/products/${id}`);
    }

    createCategory(category: any) {
        return this.http.post<{ data: Category }>(`${this.apiUrl}/categories`, category);
    }

    updateCategory(id: number, category: any) {
        // If it's FormData, we use POST with _method=PUT for better compatibility
        if (category instanceof FormData) {
            category.append('_method', 'PUT');
            return this.http.post<{ data: Category }>(`${this.apiUrl}/categories/${id}`, category);
        }
        return this.http.put<{ data: Category }>(`${this.apiUrl}/categories/${id}`, category);
    }

    deleteCategory(id: number) {
        return this.http.delete(`${this.apiUrl}/categories/${id}`);
    }

    getSubscribers() {
        return this.http.get<{ data: any[] }>(`${this.apiUrl}/subscribers`);
    }
}
