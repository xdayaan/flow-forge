export interface User {
    id: string; // GUID
    email: string;
    fullName: string;
    role: 'Admin' | 'Manager' | 'Member';
    tenantId: string;
    isActive: boolean;
}

export interface AuthResponse {
    token: string;
    tenantId: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    organizationName: string;
}
