export interface Category {
    id: number;
    nombre: string;
    parent_id: number | null;
    activa: boolean;
    children?: Category[]; // Recursive for nested categories
    created_at?: string;
    updated_at?: string;
}
