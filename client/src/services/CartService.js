import api from '../api/axios';

class CartService {
    async getCart() {
        const response = await api.get("/cart");
        return response.data;
    }

    async addToCart(variantId, quantity) {
        const response = await api.post("/cart", {
            producto_variante_id: variantId,
            cantidad: quantity
        });
        return response.data;
    }

    async updateItem(itemId, quantity) {
        const response = await api.put(`/cart/${itemId}`, {
            cantidad: quantity
        });
        return response.data;
    }

    async removeItem(itemId) {
        const response = await api.delete(`/cart/${itemId}`);
        return response.data;
    }
}

export default new CartService();
