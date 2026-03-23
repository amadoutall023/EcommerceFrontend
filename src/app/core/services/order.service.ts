import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order } from '../models';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    constructor(private http: HttpClient) { }

    getHistory() {
        return this.http.get<{ data: Order[] }>(`${environment.apiUrl}/orders`).pipe(
            map(res => res.data)
        );
    }

    getOrderDetails(id: number) {
        return this.http.get<{ data: Order }>(`${environment.apiUrl}/orders/${id}`).pipe(
            map(res => res.data)
        );
    }
}
