import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const data = await AuthService.login(credentials);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    const updateUser = async () => {
        const userData = await AuthService.verifyAuth();
        if (userData) {
            setUser(userData);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
