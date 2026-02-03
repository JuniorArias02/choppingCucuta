export const MOCK_PRODUCTS = [
    {
        id: 1,
        nombre: "Auriculares Inalámbricos Pro Noise Cancelling",
        descripcion: "Experimenta el silencio con nuestra cancelación de ruido activa avanzada. Audio de alta fidelidad, batería de 30 horas y diseño ergonómico para uso todo el día.",
        marca: "AudioMax",
        categoria: "Electrónica",
        imagenes: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80"
        ],
        activo: true,
        variantes: [
            {
                id: 101,
                sku: "AUD-NEG-001",
                precio: 89.99,
                stock: 50,
                atributos: { Color: "Negro Mate" }
            },
            {
                id: 102,
                sku: "AUD-BLA-002",
                precio: 89.99,
                stock: 12,
                atributos: { Color: "Blanco Perla" }
            },
            {
                id: 103,
                sku: "AUD-AZU-003",
                precio: 95.00, // Variación de precio
                stock: 0, // Agotado
                atributos: { Color: "Azul Marino" }
            }
        ]
    },
    {
        id: 2,
        nombre: "Zapatillas Running Ultraligeras Breathable",
        descripcion: "Corre más lejos con menos esfuerzo. Malla transpirable, suela de espuma reactiva y soporte de arco dinámico.",
        marca: "RunFast",
        categoria: "Deportes",
        imagenes: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80"
        ],
        activo: true,
        variantes: [
            {
                id: 201,
                sku: "ZAP-38-ROJ",
                precio: 45.50,
                stock: 100,
                atributos: { Talla: "38", Color: "Rojo Fuego" }
            },
            {
                id: 202,
                sku: "ZAP-40-ROJ",
                precio: 45.50,
                stock: 5, // Poco stock
                atributos: { Talla: "40", Color: "Rojo Fuego" }
            },
            {
                id: 203,
                sku: "ZAP-42-NEO",
                precio: 49.99,
                stock: 20,
                atributos: { Talla: "42", Color: "Neón" }
            }
        ]
    },
    {
        id: 3,
        nombre: "Smartwatch Deportivo Fitness Tracker 2026",
        descripcion: "Monitor de ritmo cardíaco, oxígeno en sangre, GPS integrado y resistencia al agua 5ATM.",
        marca: "TechWear",
        categoria: "Electrónica",
        imagenes: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80"
        ],
        activo: true,
        variantes: [
            {
                id: 301,
                sku: "WAT-SIL",
                precio: 29.99,
                stock: 200,
                atributos: { Correa: "Silicona", Color: "Negro" }
            },
            {
                id: 302,
                sku: "WAT-LEA",
                precio: 39.99,
                stock: 15,
                atributos: { Correa: "Cuero", Color: "Marrón" }
            }
        ]
    },
    {
        id: 4,
        nombre: "Camiseta Básica Algodón Orgánico Pack x3",
        descripcion: "Suavidad premium. 100% algodón orgánico pre-encogido. Corte moderno fit.",
        marca: "EcoStyle",
        categoria: "Ropa",
        imagenes: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80"
        ],
        activo: true,
        variantes: [
            {
                id: 401,
                sku: "TSH-S-MIX",
                precio: 24.99,
                stock: 50,
                atributos: { Talla: "S", Pack: "Blanco/Negro/Gris" }
            },
            {
                id: 402,
                sku: "TSH-M-MIX",
                precio: 24.99,
                stock: 0,
                atributos: { Talla: "M", Pack: "Blanco/Negro/Gris" }
            },
            {
                id: 403,
                sku: "TSH-L-MIX",
                precio: 24.99,
                stock: 80,
                atributos: { Talla: "L", Pack: "Blanco/Negro/Gris" }
            }
        ]
    },
    {
        id: 5,
        nombre: "Mochila Antirrobo Impermeable USB",
        descripcion: "Viaja seguro. Cierre oculto, puerto de carga USB, compartimento para laptop de 15.6\".",
        marca: "UrbanGear",
        categoria: "Accesorios",
        imagenes: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80"
        ],
        activo: true,
        variantes: [
            {
                id: 501,
                sku: "BAG-GRY",
                precio: 35.00,
                stock: 30,
                atributos: { Color: "Gris Oxford" }
            },
            {
                id: 502,
                sku: "BAG-BLK",
                precio: 35.00,
                stock: 45,
                atributos: { Color: "Negro Intenso" }
            }
        ]
    },
];

export const MOCK_CATEGORIES = [
    { id: 1, name: "Electrónica", icon: "🔌" },
    { id: 2, name: "Ropa", icon: "👕" },
    { id: 3, name: "Hogar", icon: "🏠" },
    { id: 4, name: "Deportes", icon: "⚽" },
    { id: 5, name: "Juguetes", icon: "🧸" },
    { id: 6, name: "Belleza", icon: "💄" },
];
