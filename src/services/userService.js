import { API_CONFIG } from './config.js';
import httpClient from './httpClient.js';

class UserService {
  async updateProfile(userData) {
    return httpClient.put(API_CONFIG.ENDPOINTS.USER_PROFILE, userData);
  }

  async uploadAvatar(formData) {
    return httpClient.uploadFile(API_CONFIG.ENDPOINTS.USER_AVATAR, formData);
  }

  async changePassword(currentPassword, newPassword) {
    return httpClient.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async getUsers() {
    return httpClient.get(API_CONFIG.ENDPOINTS.USERS);
  }
}

export default new UserService();