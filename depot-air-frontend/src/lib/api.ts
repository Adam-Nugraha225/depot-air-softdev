import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://depot-air-backend.vercel.app/api'
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role: string }) => api.post('/auth/register', data),
  googleLogin: (data: { email: string; name: string }) => api.post('/auth/google-login', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { name?: string; phone?: string }) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: { recipientName: string; province: string; city: string; district: string; postalCode: string; street: string; details?: string; isPrimary?: boolean }) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: { recipientName: string; province: string; city: string; district: string; postalCode: string; street: string; details?: string; isPrimary?: boolean }) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  getPaymentMethods: () => api.get('/users/payment-methods'),
  addPaymentMethod: (data: { type: string; details: string }) => api.post('/users/payment-methods', data),
};

// Vendor APIs
export const vendorAPI = {
  getVendors: (search?: string) => api.get('/vendors', { params: { search } }),
  getVendorById: (id: string) => api.get(`/vendors/${id}`),
  updateProfile: (data: { specialty?: string; mainLocation?: string; pricePerLiter?: number; defaultCapacity?: number }) => api.put('/vendors/profile', data),
};

// Order APIs
export const orderAPI = {
  createOrder: (data: { vendorId: string; volume: number; paymentMethod?: string; serviceFee?: number; deliveryNotes?: string; address?: string; waterType?: string; deliverySchedule?: string }) => api.post('/orders', data),
  getOrders: (params?: { status?: string; search?: string }) => api.get('/orders', { params }),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

// Fleet APIs
export const fleetAPI = {
  getFleets: () => api.get('/fleets'),
  addFleet: (data: { truckId: string; driverName: string; truckType?: string; licensePlate?: string; capacity?: number }) => api.post('/fleets', data),
  updateFleetStatus: (id: string, data: { status: string; lat?: number; lng?: number }) => api.put(`/fleets/${id}/status`, data),
  assignFleetToOrder: (data: { orderId: string; fleetId: string }) => api.post('/fleets/assign', data),
};

// Chat APIs
export const chatAPI = {
  getActiveChats: () => api.get('/chats'),
  getMessages: (userId: string) => api.get(`/chats/${userId}`),
  sendMessage: (data: { receiverId: string; content: string }) => api.post('/chats', data),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};
