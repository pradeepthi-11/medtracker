import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add Interceptor for Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const medicineApi = {
    getAll: () => api.get('/medicines'),
    getById: (id) => api.get(`/medicines/${id}`),
    add: (data) => api.post('/medicines', data),
    update: (id, data) => api.put(`/medicines/${id}`, data),
    delete: (id) => api.delete(`/medicines/${id}`)
};

export const trackingApi = {
    getDaily: (date) => api.get(`/tracking/${date}`),
    updateStatus: (id, status) => api.put(`/tracking/${id}`, { status })
};

export default api;
