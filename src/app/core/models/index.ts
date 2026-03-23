export interface User {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    role: 'user' | 'admin';
    created_at?: string;
}

export interface AuthResponse {
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
}

export interface Product {
    id: number;
    category_id: number;
    category_name: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    original_price?: number;
    stock: number;
    image_url: string;
    images?: string[];
    sizes?: string[];
    colors?: string[];
}

export interface CartItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    selected_size?: string;
    selected_color?: string;
    subtotal: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total: number;
}

export interface GuestCheckoutPayload {
    is_first_order: boolean;
    phone: string;
    name?: string;
    items: Array<{
        product_id: number;
        quantity: number;
        selected_size?: string;
        selected_color?: string;
    }>;
}

export interface Order {
    id: number;
    user_id?: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    created_at: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    items: (CartItem & { product_name: string })[];
}
