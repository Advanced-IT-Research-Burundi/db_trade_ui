import authService from './authService.js';
import userService from './userService.js';
import dataService from './dataService.js';
import httpClient from './httpClient.js';
import tokenManager from './tokenManager.js';

class ApiService {
  constructor() {
    this.auth = authService;
    this.user = userService;
    this.data = dataService;
    this.http = httpClient;
    this.token = tokenManager;
  }

  async login(credentials) { return this.auth.login(credentials); }
  async logout() { return this.auth.logout(); }
  async register(userData) { return this.auth.register(userData); }
  async forgotPassword(email) { return this.auth.forgotPassword(email); }
  async resetPassword(token, newPassword) { return this.auth.resetPassword(token, newPassword); }
  async getCurrentUser() { return this.auth.getCurrentUser(); }
  async refreshToken() { return this.auth.refreshToken(); }
  async verifyToken() { return this.auth.verifyToken(); }

  async updateProfile(userData) { return this.user.updateProfile(userData); }
  async uploadAvatar(formData) { return this.user.uploadAvatar(formData); }
  async changePassword(currentPassword, newPassword) { return this.user.changePassword(currentPassword, newPassword); }

  async getDashboardData() { return this.data.getDashboardData(); }
  async getProducts(params = {}) { return this.data.getProducts(params); }
  async getClients(params = {}) { return this.data.getClients(params); }
  async getSales(params = {}) { return this.data.getSales(params); }
  async getStocks(params = {}) { return this.data.getStocks(params); }
  async getCategories() { return this.data.getCategories(); }
  async getSuppliers() { return this.data.getSuppliers(); }
  async getPurchases(params = {}) { return this.data.getPurchases(params); }
  async getUsers() { return this.user.getUsers(); }
  async getVehicles() { return this.data.getVehicles(); }
  async getCashRegisters() { return this.data.getCashRegisters(); }
  async getCashTransactions(params = {}) { return this.data.getCashTransactions(params); }
  async getExpenses(params = {}) { return this.data.getExpenses(params); }
  async getExpenseTypes() { return this.data.getExpenseTypes(); }

  // HTTP methods pour compatibilité
  async request(endpoint, options = {}) { return this.http.request(endpoint, options); }
  async post(endpoint, data) { return this.http.post(endpoint, data); }
  async put(endpoint, data) { return this.http.put(endpoint, data); }
  async patch(endpoint, data) { return this.http.patch(endpoint, data); }
  async delete(endpoint) { return this.http.delete(endpoint); }
  async get(endpoint, params = {}) { return this.http.get(endpoint, params); }

  setToken(token) { return this.token.setToken(token); }
  clearToken() { return this.token.clearToken(); }
  isAuthenticated() { return this.token.isAuthenticated(); }
  getToken() { return this.token.getToken(); }
}

export default new ApiService();