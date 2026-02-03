import { createContext, useContext, useState, useEffect } from 'react';
import CartService from '../services/CartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshCart = async () => {
        if (!user) {
            setCart([]);
            setCount(0);
            return;
        }

        try {
            const items = await CartService.getCart();
            // Ensure items is an array, CartController returns array of items directly
            const safeItems = Array.isArray(items) ? items : [];
            setCart(safeItems);

            // Calculate total items count (sum of quantities)
            const totalCount = safeItems.reduce((acc, item) => acc + item.cantidad, 0);
            setCount(totalCount);
        } catch (error) {
            console.error("Error refreshing cart", error);
        }
    };

    // Load cart when user changes
    useEffect(() => {
        refreshCart();
    }, [user]);

    const addToCart = async (variantId, quantity) => {
        setLoading(true);
        try {
            await CartService.addToCart(variantId, quantity);
            await refreshCart();
            return true;
        } catch (error) {
            console.error("Error adding to cart", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        setLoading(true);
        try {
            await CartService.removeItem(itemId);
            await refreshCart();
        } catch (error) {
            console.error("Error removing from cart", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        setLoading(true);
        try {
            await CartService.updateItem(itemId, quantity);
            await refreshCart();
        } catch (error) {
            console.error("Error updating cart quantity", error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        cart,
        count,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
