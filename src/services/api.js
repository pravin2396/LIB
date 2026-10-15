import axios from 'axios';

// Create configured Axios instance for Third-Party API (DummyJSON)
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 6000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
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
    console.warn('Third-Party API Warning:', error?.response?.status || error?.message);
    return Promise.reject(error);
  }
);

export default api;
