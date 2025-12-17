import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Movie APIs
export const movieAPI = {
    getAll: (params) => api.get('/movies', { params }),
    getById: (id) => api.get(`/movies/${id}`),
    getShowtimes: (id, params) => api.get(`/movies/${id}/showtimes`, { params }),
    getShowtimeById: (id) => api.get(`/movies/showtime/${id}`),

    // Admin
    create: (data) => api.post('/movies', data),
    update: (id, data) => api.put(`/movies/${id}`, data),
    delete: (id) => api.delete(`/movies/${id}`),
    getAllAdmin: () => api.get('/movies/admin/all'),

    // TMDB Integration
    searchTMDB: (query) => api.get('/movies/tmdb/search', { params: { query } }),
    syncFromTMDB: (tmdbId) => api.post('/movies/tmdb/sync', { tmdbId }),
    getPopularFromTMDB: () => api.get('/movies/tmdb/popular')
};

// Theater APIs
export const theaterAPI = {
    getAll: (params) => api.get('/theaters', { params }),
    getById: (id) => api.get(`/theaters/${id}`),

    // Admin
    create: (data) => api.post('/theaters', data),
    update: (id, data) => api.put(`/theaters/${id}`, data),
    delete: (id) => api.delete(`/theaters/${id}`),

    // Showtimes
    createShowtime: (data) => api.post('/theaters/showtimes', data),
    updateShowtime: (id, data) => api.put(`/theaters/showtimes/${id}`, data),
    deleteShowtime: (id) => api.delete(`/theaters/showtimes/${id}`),
    getAllShowtimes: () => api.get('/theaters/showtimes/all'),
};

// Booking APIs
export const bookingAPI = {
    lockSeats: (data) => api.post('/bookings/lock-seats', data),
    createPayment: (data) => api.post('/bookings/create-payment', data),
    create: (data) => api.post('/bookings', data),
    getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    downloadTicket: (id) => api.get(`/bookings/${id}/download-ticket`, { responseType: 'blob' }),

    // Admin
    getAll: () => api.get('/bookings/admin/all'),
    getStats: (params) => api.get('/bookings/admin/stats', { params }),
};

// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};
