import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, Order, Category } from '../models';
import { map } from 'rxjs';

export interface AdminStats {
    total_sales: number;
    orders_count: number;
    pending_orders: number;
    total_users: number;
}

export type OrderStatus = Order['status'];

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
        return this.http.get<{ data: Order[] }>(`${this.apiUrl}/orders`);
    }

    updateOrderStatus(orderId: number, status: OrderStatus) {
        return this.http.put(`${this.apiUrl}/orders/${orderId}/status`, { status });
    }

    deleteOrder(orderId: number) {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/orders/${orderId}`).pipe(
            map(res => res.message)
        );
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

    createCategory(category: FormData) {
        return this.http.post<{ data: Category }>(`${this.apiUrl}/categories`, category);
    }

    updateCategory(id: number, category: FormData) {
        category.append('_method', 'PUT');
        return this.http.post<{ data: Category }>(`${this.apiUrl}/categories/${id}`, category);
    }

    deleteCategory(id: number) {
        return this.http.delete(`${this.apiUrl}/categories/${id}`);
    }

    getSubscribers() {
        return this.http.get<{ data: Array<{ email: string; created_at: string }> }>(`${this.apiUrl}/subscribers`);
    }
}
