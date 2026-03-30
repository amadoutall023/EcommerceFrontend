import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { User, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSignal = signal<User | null>(null);
    private userLoadRequest$?: Observable<User | null>;
    currentUser = this.currentUserSignal.asReadonly();

    constructor(private http: HttpClient, private router: Router) {
        if (this.isAuthenticated()) {
            this.ensureCurrentUserLoaded().subscribe();
        } else if (this.getToken()) {
            localStorage.removeItem('token');
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

    ensureCurrentUserLoaded(): Observable<User | null> {
        const token = this.getToken();

        if (!token) {
            this.currentUserSignal.set(null);
            return of(null);
        }

        const currentUser = this.currentUserSignal();
        if (currentUser) {
            return of(currentUser);
        }

        if (!this.userLoadRequest$) {
            this.userLoadRequest$ = this.loadUser().pipe(
                map(res => res.data),
                catchError(() => {
                    localStorage.removeItem('token');
                    this.currentUserSignal.set(null);
                    return of(null);
                }),
                finalize(() => {
                    this.userLoadRequest$ = undefined;
                }),
                shareReplay(1)
            );
        }

        return this.userLoadRequest$;
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
