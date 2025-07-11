import { API_CONFIG } from './config.js';
import httpClient from './httpClient.js';
import tokenManager from './tokenManager.js';

class AuthService {
  async login(credentials) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data = await response.json();
      
      if (data.token) {
        tokenManager.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }

  async logout() {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      tokenManager.clearToken();
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
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

  async getCurrentUser() {
    try {
      const response = await httpClient.get(API_CONFIG.ENDPOINTS.USER);
      return response;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Session expirée')) {
        tokenManager.clearToken();
      }
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await httpClient.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN);
      
      if (response.token) {
        tokenManager.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      tokenManager.clearToken();
      throw error;
    }
  }

  async verifyToken() {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Token invalide ou expiré:', error);
      return false;
    }
  }

  isAuthenticated() {
    return tokenManager.isAuthenticated();
  }

  getToken() {
    return tokenManager.getToken();
  }
}

export default new AuthService();