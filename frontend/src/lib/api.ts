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

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
    const response: AxiosResponse<InventoryItem> = await api.patch(`/inventory/${id}`, item);
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
    const response: AxiosResponse<Table> = await api.get(`/tables/qr/${qrCode}`);
    return response.data;
  },

  getById: async (id: number): Promise<Table> => {
    const response: AxiosResponse<Table> = await api.get(`/tables/${id}`);
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

  createByQR: async (qrCode: string, order: Omit<CreateOrder, 'table_id'>): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.post(`/orders/qr/${qrCode}`, order);
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
};

export default api;