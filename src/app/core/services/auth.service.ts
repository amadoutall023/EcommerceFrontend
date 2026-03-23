import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { User, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSignal = signal<User | null>(null);
    currentUser = this.currentUserSignal.asReadonly();

    constructor(private http: HttpClient, private router: Router) {
        const token = this.getToken();
        if (token) {
            // Decode and check expiry if needed
            // Simple check for now
            this.loadUser().subscribe();
        }
    }

    register(data: any) {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
            tap(res => this.handleAuth(res))
        );
    }

    login(data: any) {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data).pipe(
            tap(res => this.handleAuth(res))
        );
    }

    logout() {
        this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
        localStorage.removeItem('token');
        this.currentUserSignal.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    isAdmin(): boolean {
        const user = this.currentUserSignal();
        return user?.role === 'admin';
    }

    private handleAuth(res: AuthResponse) {
        localStorage.setItem('token', res.data.token);
        this.currentUserSignal.set(res.data.user);
    }

    private loadUser() {
        return this.http.get<{ data: User }>(`${environment.apiUrl}/auth/me`).pipe(
            tap(res => this.currentUserSignal.set(res.data))
        );
    }
}
