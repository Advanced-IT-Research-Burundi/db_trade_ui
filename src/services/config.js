
const API_BASE_URL = import.meta.env.VITE_APP_DEV_MODE_LOCAL ? import.meta.env.VITE_APP_BASE_URL_LOCAL : import.meta.env.VITE_APP_BASE_URL;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    REGISTER: '/api/register',
    FORGOT_PASSWORD: '/api/forgot-password',
    RESET_PASSWORD: '/api/reset-password',
    REFRESH_TOKEN: '/api/refresh-token',
    USER: '/api/profil',
    USER_PROFILE: '/api/user/profile',
    USER_AVATAR: '/api/user/avatar',
    CHANGE_PASSWORD: '/api/user/change-password',
    // Data
    DASHBOARD: '/api/dashboard',
    PRODUCTS: '/api/products',
    CLIENTS: '/api/clients',
    SALES: '/api/sales',
    STOCKS: '/api/stocks',
    CATEGORIES: '/api/categories',
    SUPPLIERS: '/api/suppliers',
    PURCHASES: '/api/purchases',
    USERS: '/api/users',
    VEHICLES: '/api/vehicules',
    CASH_REGISTERS: '/api/cash-registers',
    CASH_TRANSACTIONS: '/api/cash-transactions',
    EXPENSES: '/api/expenses',
    EXPENSE_TYPES: '/api/expense-types',
    
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
