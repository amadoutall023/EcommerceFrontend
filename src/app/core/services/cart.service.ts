import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Cart, GuestCheckoutPayload, Product } from '../models';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private readonly storageKey = 'cart';
    private readonly emptyCart: Cart = { id: 0, items: [], total: 0 };
    private cartSignal = signal<Cart>(this.readStoredCart());

    cart = computed(() => this.cartSignal());
    itemCount = computed(() => this.cartSignal().items.reduce((acc, item) => acc + item.quantity, 0));

    constructor() {
        effect(() => {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cartSignal()));
        });
    }

    loadCart(): Observable<Cart> {
        if (!this.authService.isAuthenticated()) {
            return of(this.cartSignal());
        }

        return this.http.get<{ data: Cart }>(`${environment.apiUrl}/cart`).pipe(
            tap(res => this.cartSignal.set(res.data)),
            switchMap(res => of(res.data))
        );
    }

    addToCart(product: Product, quantity: number = 1, selectedSize?: string, selectedColor?: string): Observable<unknown> {
        if (this.authService.isAuthenticated()) {
            return this.http.post(`${environment.apiUrl}/cart/add`, {
                product_id: product.id,
                quantity,
                selected_size: selectedSize,
                selected_color: selectedColor
            }).pipe(
                tap(() => this.loadCart().subscribe())
            );
        }

        const current = this.cartSignal();
        const existingItem = current.items.find(item =>
            item.product_id === product.id &&
            item.selected_size === selectedSize &&
            item.selected_color === selectedColor
        );

        const items = existingItem
            ? current.items.map(item => item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.unit_price }
                : item)
            : [
                ...current.items,
                {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    product_id: product.id,
                    product_name: product.name,
                    product_image: product.image_url,
                    quantity,
                    unit_price: product.price,
                    selected_size: selectedSize,
                    selected_color: selectedColor,
                    available_colors: product.colors,
                    subtotal: product.price * quantity,
                }
            ];

        this.setGuestCartItems(items);
        return of({ success: true });
    }

    updateQuantity(itemId: number, quantity: number): Observable<unknown> {
        if (this.authService.isAuthenticated()) {
            return this.http.put(`${environment.apiUrl}/cart/update`, { item_id: itemId, quantity }).pipe(
                tap(() => this.loadCart().subscribe())
            );
        }

        const items = this.cartSignal().items.map(item =>
            item.id === itemId
                ? { ...item, quantity, subtotal: item.unit_price * quantity }
                : item
        );

        this.setGuestCartItems(items);
        return of({ success: true });
    }

    updateVariant(itemId: number, quantity: number, selectedSize?: string, selectedColor?: string): Observable<unknown> {
        if (this.authService.isAuthenticated()) {
            return this.http.put(`${environment.apiUrl}/cart/update`, {
                item_id: itemId,
                quantity,
                selected_size: selectedSize,
                selected_color: selectedColor
            }).pipe(
                tap(() => this.loadCart().subscribe())
            );
        }

        const current = this.cartSignal();
        const currentItem = current.items.find(item => item.id === itemId);
        if (!currentItem) {
            return of({ success: false });
        }

        const nextSize = selectedSize ?? currentItem.selected_size;
        const nextColor = selectedColor ?? currentItem.selected_color;
        const matchingItem = current.items.find(item =>
            item.id !== itemId &&
            item.product_id === currentItem.product_id &&
            item.selected_size === nextSize &&
            item.selected_color === nextColor
        );

        const items = matchingItem
            ? current.items
                .filter(item => item.id !== itemId)
                .map(item => item.id === matchingItem.id
                    ? {
                        ...item,
                        quantity: item.quantity + quantity,
                        subtotal: (item.quantity + quantity) * item.unit_price,
                    }
                    : item)
            : current.items.map(item =>
                item.id === itemId
                    ? {
                        ...item,
                        quantity,
                        selected_size: nextSize,
                        selected_color: nextColor,
                        subtotal: item.unit_price * quantity,
                    }
                    : item
            );

        this.setGuestCartItems(items);
        return of({ success: true });
    }

    remove(itemId: number): Observable<unknown> {
        if (this.authService.isAuthenticated()) {
            return this.http.delete(`${environment.apiUrl}/cart/remove/${itemId}`).pipe(
                tap(() => this.loadCart().subscribe())
            );
        }

        const items = this.cartSignal().items.filter(item => item.id !== itemId);
        this.setGuestCartItems(items);
        return of({ success: true });
    }

    checkout(): Observable<{ data: unknown }> {
        return this.http.post<{ data: unknown }>(`${environment.apiUrl}/cart/checkout`, {}).pipe(
            tap(() => this.resetCart())
        );
    }

    guestCheckout(payload: Omit<GuestCheckoutPayload, 'items'>): Observable<{ data: unknown }> {
        const items = this.cartSignal().items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            selected_size: item.selected_size,
            selected_color: item.selected_color,
        }));

        return this.http.post<{ data: unknown }>(`${environment.apiUrl}/checkout/guest`, {
            ...payload,
            items,
        }).pipe(
            tap(() => this.resetCart())
        );
    }

    private setGuestCartItems(items: Cart['items']) {
        this.cartSignal.set({
            id: 0,
            items,
            total: this.calculateTotal(items),
        });
    }

    private resetCart() {
        this.cartSignal.set(this.emptyCart);
        localStorage.removeItem(this.storageKey);
    }

    private readStoredCart(): Cart {
        const savedCart = localStorage.getItem(this.storageKey);
        if (!savedCart) {
            return this.emptyCart;
        }

        try {
            const parsed = JSON.parse(savedCart) as Cart;
            return {
                id: parsed.id ?? 0,
                items: parsed.items ?? [],
                total: parsed.total ?? this.calculateTotal(parsed.items ?? []),
            };
        } catch {
            return this.emptyCart;
        }
    }

    private calculateTotal(items: Cart['items']): number {
        return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    }
}
