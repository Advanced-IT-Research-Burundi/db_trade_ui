const API_BASE_URL = 'http://192.168.1.37:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expirée');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }

  async logout() {
    return this.request('/api/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/user');
  }

  // Data endpoints
  async getDashboardData() {
    return this.request('/api/dashboard');
  }

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/products${queryString ? `?${queryString}` : ''}`);
  }

  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/clients${queryString ? `?${queryString}` : ''}`);
  }

  async getSales(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/sales${queryString ? `?${queryString}` : ''}`);
  }

  async getStocks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/stocks${queryString ? `?${queryString}` : ''}`);
  }

  async getCategories() {
    return this.request('/api/categories');
  }

  async getSuppliers() {
    return this.request('/api/suppliers');
  }

  async getPurchases(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/purchases${queryString ? `?${queryString}` : ''}`);
  }

  async getUsers() {
    return this.request('/api/users');
  }

  async getVehicles() {
    return this.request('/api/vehicules');
  }

  async getCashRegisters() {
    return this.request('/api/cash-registers');
  }

  async getCashTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/cash-transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getExpenses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/expenses${queryString ? `?${queryString}` : ''}`);
  }

  async getExpenseTypes() {
    return this.request('/api/expense-types');
  }

  // CRUD operations helpers
  async create(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
