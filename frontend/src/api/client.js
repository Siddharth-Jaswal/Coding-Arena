import axios from 'axios';

const rawMode = (import.meta.env.VITE_APP_MODE || import.meta.env.MODE || (import.meta.env.PROD ? 'prod' : 'local')).toLowerCase();
const isProdMode = rawMode === 'prod' || rawMode === 'production';

const resolvedBaseURL = isProdMode
  ? (import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL || '')
  : (import.meta.env.VITE_LOCAL_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000');

const apiClient = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arena_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    
    const customError = new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred');
    customError.status = error.response?.status;
    return Promise.reject(customError);
  }
);

export default apiClient;
