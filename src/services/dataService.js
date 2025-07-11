import { API_CONFIG } from './config.js';
import httpClient from './httpClient.js';

class DataService {
  // Dashboard
  async getDashboardData() {
    return httpClient.get(API_CONFIG.ENDPOINTS.DASHBOARD);
  }

  // Products
  async getProducts(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.PRODUCTS, params);
  }

  // Clients
  async getClients(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.CLIENTS, params);
  }

  // Sales
  async getSales(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.SALES, params);
  }

  // Stocks
  async getStocks(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.STOCKS, params);
  }

  // Categories
  async getCategories() {
    return httpClient.get(API_CONFIG.ENDPOINTS.CATEGORIES);
  }

  // Suppliers
  async getSuppliers() {
    return httpClient.get(API_CONFIG.ENDPOINTS.SUPPLIERS);
  }

  // Purchases
  async getPurchases(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.PURCHASES, params);
  }

  // Vehicles
  async getVehicles() {
    return httpClient.get(API_CONFIG.ENDPOINTS.VEHICLES);
  }

  // Cash Registers
  async getCashRegisters() {
    return httpClient.get(API_CONFIG.ENDPOINTS.CASH_REGISTERS);
  }

  // Cash Transactions
  async getCashTransactions(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.CASH_TRANSACTIONS, params);
  }

  // Expenses
  async getExpenses(params = {}) {
    return httpClient.get(API_CONFIG.ENDPOINTS.EXPENSES, params);
  }

  // Expense Types
  async getExpenseTypes() {
    return httpClient.get(API_CONFIG.ENDPOINTS.EXPENSE_TYPES);
  }
}

export default new DataService();