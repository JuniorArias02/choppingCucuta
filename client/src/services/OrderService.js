import api from '../api/axios';

class OrderService {
    async getOrders(params = {}) {
        const response = await api.get('/orders', { params });
        return response.data;
    }

    async createOrder(data) {
        const response = await api.post('/orders', data);
        return response.data;
    }
}

export default new OrderService();
