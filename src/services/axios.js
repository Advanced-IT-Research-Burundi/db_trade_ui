import axios from 'axios';

const axiosInstance = axios.create({
   baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                localStorage.removeItem('token');
                window.location.href = '/login';
                break;
                case 404:
                console.error('Resource not found');
                break;
            }
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;