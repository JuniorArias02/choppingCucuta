import api from '../api/axios';

class AuthService {
    async register(data) {
        const response = await api.post('/register', data);
        return response.data;
    }

    async login(credentials) {
        const response = await api.post('/login', credentials);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    async logout() {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    async updateProfile(data) {
        const response = await api.put('/profile', data);
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // Trigger storage event to update other tabs/components listening
            window.dispatchEvent(new Event('storage'));
        }
        return response.data;
    }

    async changePassword(data) {
        const response = await api.put('/password', data);
        return response.data;
    }

    async verifyAuth() {
        try {
            const response = await api.get('/user');
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                return response.data;
            }
        } catch (error) {
            console.error('Auth verification failed', error);
            return null;
        }
    }
}

export default new AuthService();
