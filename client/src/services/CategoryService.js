import api from '../api/axios';

/**
 * Service for managing Categories.
 * Corresponding to backend CategoryController.
 */
class CategoryService {
    /**
     * Get all categories.
     * @returns {Promise<import('../types/category').Category[]>}
     */
    async getAll(params = {}) {
        const response = await api.get('/categories', { params });
        return response.data;
    }

    /**
     * Get categories as a tree structure (nested children).
     * @returns {Promise<import('../types/category').Category[]>}
     */
    async getTree() {
        const response = await api.get('/categories?tree=true');
        return response.data;
    }

    /**
     * Create a new category.
     * @param {Partial<import('../types/category').Category>} data 
     */
    async create(data) {
        const response = await api.post('/categories', data);
        return response.data;
    }

    /**
     * Update a category.
     * @param {number} id 
     * @param {Partial<import('../types/category').Category>} data 
     */
    async update(id, data) {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    }

    /**
     * Delete a category.
     * @param {number} id 
     */
    async delete(id) {
        await api.delete(`/categories/${id}`);
    }
}

export default new CategoryService();
