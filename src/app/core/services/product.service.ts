import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category, Product } from '../models';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private http: HttpClient) { }

    getCatalog(categoryId?: number, search?: string, includeOutOfStock: boolean = false) {
        let params = new HttpParams();
        if (categoryId) params = params.set('category_id', categoryId);
        if (search) params = params.set('search', search);
        if (includeOutOfStock) params = params.set('include_out_of_stock', '1');

        return this.http.get<{ data: { products: Product[], categories: Category[] } }>(`${environment.apiUrl}/products`, { params }).pipe(
            map(res => res.data)
        );
    }

    getProduct(id: number) {
        return this.http.get<{ data: Product }>(`${environment.apiUrl}/products/${id}`).pipe(
            map(res => res.data)
        );
    }

    getCategories() {
        return this.http.get<{ data: Category[] }>(`${environment.apiUrl}/categories`).pipe(
            map(res => res.data)
        );
    }
}
