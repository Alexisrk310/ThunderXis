export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    // Optional specific fields
    variants?: ProductVariant[];
    isNew?: boolean;
    gender?: 'Men' | 'Women' | 'Unisex';
    stock_by_size?: Record<string, number>;
}

export interface ProductVariant {
    id: string;
    name: string; // e.g., "Size", "Color"
    options: string[]; // e.g., ["S", "M", "L"]
}
