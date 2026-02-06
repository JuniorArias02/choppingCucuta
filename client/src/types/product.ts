export interface ProductAttribute {
    [key: string]: string; // e.g. { "Color": "Rojo", "Talla": "M" }
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku?: string;
    precio: number;
    stock: number;
    atributos: ProductAttribute;
}

export interface ProductImage {
    id: number;
    product_id: number;
    url: string;
}

export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    categoria_id?: number;
    categoria?: string; // If joined
    marca: string;
    activo: boolean;
    descuento?: number;
    imagenes: string[]; // Simplification for frontend UI
    variantes: ProductVariant[];
    created_at?: string;
    updated_at?: string;
}
