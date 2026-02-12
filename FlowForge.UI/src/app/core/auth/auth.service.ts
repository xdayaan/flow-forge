import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    private jwtHelper = new JwtHelperService();

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromToken();
    }

    get currentUserValue(): User | null {
        return this.userSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('token');
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.setSession(response);
            })
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap(response => {
                this.setSession(response);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        this.userSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    private setSession(authResult: AuthResponse): void {
        localStorage.setItem('token', authResult.token);
        localStorage.setItem('tenantId', authResult.tenantId); // Store for API headers if needed
        this.loadUserFromToken();
    }

    private loadUserFromToken(): void {
        const token = localStorage.getItem('token');
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            const decodedToken = this.jwtHelper.decodeToken(token);

            // Map claims to User object
            // Note: Claims keys might be case-sensitive depending on backend
            const user: User = {
                id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                tenantId: decodedToken['tenant_id'],
                fullName: '', // Often not in token to keep it small, or add it if needed
                isActive: true
            };

            this.userSubject.next(user);
        } else {
            this.userSubject.next(null);
        }
    }
}
