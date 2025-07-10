const API_BASE_URL = 'http://192.168.0.112:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.init();
  }

  init() {
    this.token = localStorage.getItem('token');
  }

  
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getAuthHeaders() {
    const token = this.token || localStorage.getItem('token');
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
          this.clearToken();
          
          // Éviter la redirection infinie si on est déjà sur la page de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          throw new Error('Session expirée');
        }
        
        // Essayer de récupérer le message d'erreur du serveur
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Erreur de communication avec le serveur: ${e.message}`;
          // Ignore si impossible de parser le JSON
        }
        
        throw new Error(errorMessage);
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

      const data = await response.json();
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }

  async logout() {
    try {
      await this.request('/api/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/api/user');
      return response;
    } catch (error) {
      
      if (error.message.includes('401') || error.message.includes('Session expirée')) {
        this.clearToken();
      }
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erreur d'inscription: ${error.message}`);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseURL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande de réinitialisation');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erreur: ${error.message}`);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la réinitialisation du mot de passe');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erreur: ${error.message}`);
    }
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

  // Profile endpoints
  async updateProfile(userData) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(formData) {
    // Pour l'upload de fichier, on ne met pas Content-Type pour laisser le navigateur le gérer
    const token = this.token || localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}/api/user/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'upload');
    }

    return await response.json();
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
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

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  }

  // Méthodes utilitaires
  isAuthenticated() {
    return !!(this.token || localStorage.getItem('token'));
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // Méthode pour vérifier si le token est valide
  async verifyToken() {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Token invalide ou expiré:', error);
      return false;
    }
  }

  async refreshToken() {
    try {
      const response = await this.request('/api/refresh-token', {
        method: 'POST',
      });
      
      if (response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }
}

export default new ApiService();