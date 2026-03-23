import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    subscribe(email: string) {
        return this.http.post<{ message: string }>(`${this.apiUrl}/subscribe`, { email });
    }
}
