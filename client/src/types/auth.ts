export interface User {
    id: number;
    name: string;
    email: string;
    rol_id: number; // 1: Admin, 2: Seller, 3: Customer
    created_at?: string;
    updated_at?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    // Optional address/phone fields based on your migration
}
