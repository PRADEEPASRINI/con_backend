import axios from 'axios';

// ✅ Correct way to access environment variables in Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other storage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log all API errors for debugging
    console.error('API Error:', error);
    
    // Add global error handling logic here
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login or refresh token
      console.log('Unauthorized access detected');
      // Optional: redirect to login
      // window.location.href = '/login';
    }
    
    // Propagate the error so it can be caught in the component
    return Promise.reject(error);
  }
);

// Helper to check API connectivity
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

export default api;