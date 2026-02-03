import api from '../api/axios';

/**
 * Service for managing Products.
 */
class ProductService {
    /**
     * Get all products.
     * @returns {Promise<import('../types/product').Product[]>}
     */
    async getAll(params = {}) {
        const response = await api.get('/products', { params });
        return response.data;
    }

    /**
     * Get a single product by ID.
     * @param {number} id 
     * @returns {Promise<import('../types/product').Product>}
     */
    async getById(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    }

    /**
     * Create a new product.
     * @param {any} data 
     */
    async create(data) {
        const config = {};
        if (data instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        const response = await api.post('/products', data, config);
        return response.data;
    }

    /**
     * Update a product.
     * @param {number} id 
     * @param {any} data 
     */
    async update(id, data) {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    }

    /**
     * Delete a product.
     * @param {number} id 
     */
    async delete(id) {
        await api.delete(`/products/${id}`);
    }

    /**
     * Rate a product.
     * @param {number} id 
     * @param {object} data { usuario_id, rating, comment }
     */
    async rate(id, data) {
        const response = await api.post(`/products/${id}/rate`, data);
        return response.data;
    }

    /**
     * Like or Unlike a product.
     * @param {number} id 
     * @param {object} data { usuario_id }
     */
    async toggleLike(id, data) {
        const response = await api.post(`/products/${id}/like`, data);
        return response.data;
    }
}

export default new ProductService();
