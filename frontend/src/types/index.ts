// User and Authentication Types
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'bar' | 'waiter';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  cost_price?: number; // Only visible to admin
  sale_price: number;
  photo_url: string;
  stock: number;
  min_stock: number;
  created_at: string;
}

export interface CreateInventoryItem {
  name: string;
  category: string;
  cost_price: number;
  sale_price: number;
  photo_url: string;
  stock: number;
  min_stock: number;
}

// Table Types
export interface Table {
  id: number;
  qr_code: string;
  waiter_id: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service';
  capacity: number;
  location: string;
  created_at: string;
  updated_at: string;
  waiter?: {
    id: number;
    user: User;
  };
}

// Order Types
export interface OrderItem {
  id: number;
  inventory_id: number;
  quantity: number;
  price: number;
  unit_price: number; // Adding for compatibility
  inventory?: InventoryItem;
}

export interface Order {
  id: number;
  table_id: number;
  table_number?: number; // Adding for display purposes
  waiter_id: number;
  bar_id: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'payment_pending' | 'completed' | 'cancelled';
  total_amount: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  table?: Table;
  waiter?: {
    id: number;
    user: User;
  };
  items?: OrderItem[];
}

export interface CreateOrder {
  table_id: number;
  items: Array<{
    inventory_id: number;
    quantity: number;
  }>;
  notes?: string;
}

// Payment Types
export interface Payment {
  id: number;
  order_id: number;
  method: 'cash' | 'qr';
  status: 'pending' | 'verified' | 'rejected';
  total_amount: string;
  transaction_id?: string;
  verified_by?: number;
  created_at: string;
  updated_at: string;
  order?: Order;
  creator?: User;
  verifier?: User;
}

export interface PaymentLog {
  id: number;
  payment_id: number;
  action: 'created' | 'verified' | 'rejected';
  user_id: number;
  timestamp: string;
  notes?: string;
  user?: User;
}

export interface PaymentReceipt {
  payment_id: number;
  order_id: number;
  table: string;
  location: string;
  total_amount: string;
  method: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }>;
  verified_by?: string;
  created_at: string;
  verified_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface UpdateOrderStatus {
  status: Order['status'];
  notes?: string;
}

export interface UpdateTableStatus {
  status: Table['status'];
}

export interface VerifyPayment {
  notes?: string;
}

export interface RejectPayment {
  notes: string;
}