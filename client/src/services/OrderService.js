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

    async cancelOrder(orderId) {
        const response = await api.post(`/orders/${orderId}/cancel`);
        return response.data;
    }

    async updateOrderStatus(orderId, status) {
        const response = await api.put(`/orders/${orderId}/status`, { estado: status });
        return response.data;
    }
}

export default new OrderService();
