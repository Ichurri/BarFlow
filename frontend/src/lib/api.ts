import axios, { AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginCredentials,
  User,
  InventoryItem,
  CreateInventoryItem,
  Table,
  Order,
  CreateOrder,
  Payment,
  PaymentLog,
  PaymentReceipt,
  UpdateOrderStatus,
  UpdateTableStatus,
  VerifyPayment,
  RejectPayment,
} from '@/types';

// Create axios instance for authenticated requests
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for public requests (no auth required)
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling on authenticated requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only redirect to login if we're in the browser and it's an authenticated endpoint
      const currentPath = window.location.pathname;
      // Don't redirect if we're on public pages
      if (!currentPath.startsWith('/table') && !currentPath.startsWith('/menu')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/auth/profile');
    return response.data;
  },

  register: async (userData: LoginCredentials & { role: string }): Promise<User> => {
    const response: AxiosResponse<User> = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Inventory API
export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response: AxiosResponse<InventoryItem[]> = await api.get('/inventory');
    return response.data;
  },

  getAvailable: async (): Promise<InventoryItem[]> => {
    const response: AxiosResponse<InventoryItem[]> = await api.get('/inventory/available');
    return response.data;
  },

  getPublic: async (): Promise<InventoryItem[]> => {
    // Public endpoint for customer ordering - no authentication required
    const response: AxiosResponse<InventoryItem[]> = await publicApi.get('/inventory/public');
    return response.data;
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    const response: AxiosResponse<InventoryItem[]> = await api.get('/inventory/low-stock');
    return response.data;
  },

  getById: async (id: number): Promise<InventoryItem> => {
    const response: AxiosResponse<InventoryItem> = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (item: CreateInventoryItem): Promise<InventoryItem> => {
    const response: AxiosResponse<InventoryItem> = await api.post('/inventory', item);
    return response.data;
  },

  update: async (id: number, item: Partial<CreateInventoryItem>): Promise<InventoryItem> => {
    console.log('API update called with:', { id, item });
    const response: AxiosResponse<InventoryItem> = await api.patch(`/inventory/${id}`, item);
    console.log('API update response:', response.data);
    return response.data;
  },

  updateStock: async (id: number, stock: number): Promise<InventoryItem> => {
    const response: AxiosResponse<InventoryItem> = await api.patch(`/inventory/${id}/stock`, { stock });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
};

// Tables API
export const tablesApi = {
  getAll: async (): Promise<Table[]> => {
    const response: AxiosResponse<Table[]> = await api.get('/tables');
    return response.data;
  },

  getMyTables: async (): Promise<Table[]> => {
    const response: AxiosResponse<Table[]> = await api.get('/tables/my-tables');
    return response.data;
  },

  getByQR: async (qrCode: string): Promise<Table> => {
    const response: AxiosResponse<Table> = await publicApi.get(`/tables/qr/${qrCode}`);
    return response.data;
  },

  getById: async (id: number): Promise<Table> => {
    const response: AxiosResponse<Table> = await publicApi.get(`/tables/${id}`);
    return response.data;
  },

  create: async (table: Partial<Table>): Promise<Table> => {
    const response: AxiosResponse<Table> = await api.post('/tables', table);
    return response.data;
  },

  update: async (id: number, table: Partial<Table>): Promise<Table> => {
    const response: AxiosResponse<Table> = await api.patch(`/tables/${id}`, table);
    return response.data;
  },

  updateStatus: async (id: number, status: UpdateTableStatus): Promise<Table> => {
    const response: AxiosResponse<Table> = await api.patch(`/tables/${id}/status`, status);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response: AxiosResponse<Order[]> = await api.get('/orders');
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response: AxiosResponse<Order[]> = await api.get('/orders/my-orders');
    return response.data;
  },

  getPending: async (): Promise<Order[]> => {
    const response: AxiosResponse<Order[]> = await api.get('/orders/pending');
    return response.data;
  },

  getReady: async (): Promise<Order[]> => {
    const response: AxiosResponse<Order[]> = await api.get('/orders/ready');
    return response.data;
  },

  getByTable: async (tableId: number): Promise<Order[]> => {
    const response: AxiosResponse<Order[]> = await api.get(`/orders/table/${tableId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (order: CreateOrder): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.post('/orders', order);
    return response.data;
  },

  createCustomer: async (order: CreateOrder): Promise<Order> => {
    // Public endpoint for customer orders - no authentication required
    const response: AxiosResponse<Order> = await publicApi.post('/orders/customer', order);
    return response.data;
  },

  createByQR: async (qrCode: string, order: Omit<CreateOrder, 'table_id'>): Promise<Order> => {
    const response: AxiosResponse<Order> = await publicApi.post(`/orders/qr/${qrCode}`, order);
    return response.data;
  },

  update: async (id: number, order: Partial<Order>): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}`, order);
    return response.data;
  },

  updateStatus: async (id: number, status: UpdateOrderStatus): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}/status`, status);
    return response.data;
  },

  confirm: async (id: number): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}/confirm`);
    return response.data;
  },

  markPreparing: async (id: number): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}/preparing`);
    return response.data;
  },

  markReady: async (id: number): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}/ready`);
    return response.data;
  },

  deliver: async (id: number): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}/deliver`);
    return response.data;
  },

  requestPayment: async (id: number): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.patch(`/orders/${id}/request-payment`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  getItemsStats: async (): Promise<any> => {
    const response: AxiosResponse<any> = await api.get('/orders/items/stats');
    return response.data;
  },
};

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response: AxiosResponse<Payment[]> = await api.get('/payments');
    return response.data;
  },

  initiate: async (orderId: number, method: 'cash' | 'qr'): Promise<Payment> => {
    const response: AxiosResponse<Payment> = await api.post(`/payments/initiate/${orderId}`, { method });
    return response.data;
  },

  getPending: async (): Promise<Payment[]> => {
    const response: AxiosResponse<Payment[]> = await api.get('/payments/pending');
    return response.data;
  },

  getMyPayments: async (): Promise<Payment[]> => {
    const response: AxiosResponse<Payment[]> = await api.get('/payments/my-payments');
    return response.data;
  },

  getByOrder: async (orderId: number): Promise<Payment> => {
    const response: AxiosResponse<Payment> = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  verify: async (id: number, data: VerifyPayment): Promise<Payment> => {
    const response: AxiosResponse<Payment> = await api.patch(`/payments/${id}/verify`, data);
    return response.data;
  },

  reject: async (id: number, data: RejectPayment): Promise<Payment> => {
    const response: AxiosResponse<Payment> = await api.patch(`/payments/${id}/reject`, data);
    return response.data;
  },

  getReceipt: async (id: number): Promise<PaymentReceipt> => {
    const response: AxiosResponse<PaymentReceipt> = await api.get(`/payments/${id}/receipt`);
    return response.data;
  },

  getHistory: async (id: number): Promise<PaymentLog[]> => {
    const response: AxiosResponse<PaymentLog[]> = await api.get(`/payments/${id}/history`);
    return response.data;
  },

  // Customer payment endpoints (public - no auth required)
  initiateCustomer: async (orderId: number, method: 'cash' | 'qr'): Promise<Payment> => {
    const response: AxiosResponse<Payment> = await publicApi.post(`/payments/customer/initiate/${orderId}`, { method });
    return response.data;
  },

  confirmCustomer: async (paymentId: number): Promise<Payment> => {
    const response: AxiosResponse<Payment> = await publicApi.post(`/payments/customer/confirm/${paymentId}`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await api.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: { username: string; password: string; role: string }): Promise<User> => {
    const response: AxiosResponse<User> = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: number, userData: Partial<{ username: string; password: string; role: string }>): Promise<User> => {
    const response: AxiosResponse<User> = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Get waiter info with assigned tables
  getWaiterInfo: async (userId: number): Promise<{ waiter: User; tables: Table[] }> => {
    const response: AxiosResponse<{ waiter: User; tables: Table[] }> = await api.get(`/users/${userId}/waiter-info`);
    return response.data;
  },

  // Assign tables to a waiter
  assignTablesToWaiter: async (userId: number, tableIds: number[]): Promise<void> => {
    await api.post(`/users/${userId}/assign-tables`, { tableIds });
  },
};

export default api;