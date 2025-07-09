const API_BASE_URL = 'http://10.193.130.100:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
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
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/logout', {
      method: 'POST',
    });
  }

  // Data endpoints
  async getDashboardData() {
    return this.request('/api/dashboard');
  }

  async getProducts() {
    return this.request('/api/products');
  }

  async getClients() {
    return this.request('/api/clients');
  }

  // Add more endpoints as needed
}

export default new ApiService();

