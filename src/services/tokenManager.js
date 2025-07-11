class TokenManager {
  constructor() {
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

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getAuthHeaders() {
    const token = this.getToken();
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  handleUnauthorized() {
    this.clearToken();
    
    // Éviter la redirection infinie si on est déjà sur la page de login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

export default new TokenManager();