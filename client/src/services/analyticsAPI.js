
// Analytics APIs (Admin only)
export const analyticsAPI = {
    getStats: (params) => api.get('/analytics/stats', { params }),
    getRevenue: (params) => api.get('/analytics/revenue', { params }),
    getOccupancy: (params) => api.get('/analytics/occupancy', { params }),
    getUserMetrics: (params) => api.get('/analytics/users', { params }),
    getTrends: (params) => api.get('/analytics/trends', { params })
};
