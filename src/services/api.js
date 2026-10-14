import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: 'https://openlibrary.org',
  timeout: 12000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor for logging or authorization simulation
api.interceptors.request.use(
  (config) => {
    // In real apps, token can be appended here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.status || error?.message);
    return Promise.reject(error);
  }
);

export default api;
