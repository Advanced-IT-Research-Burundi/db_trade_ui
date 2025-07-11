// const API_BASE_URL = 'http://192.168.1.37:8000'; // URL de l'API backend en local
const API_BASE_URL = 'http://84.46.251.167:8203'; // URL de l'API backend en production

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
    USER: '/api/user',
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