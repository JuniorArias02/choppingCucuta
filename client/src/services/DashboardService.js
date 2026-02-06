import api from '../api/axios';

class DashboardService {
    /**
     * Get dashboard statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        const response = await api.get('/dashboard/stats');
        return response.data;
    }
}

export default new DashboardService();
