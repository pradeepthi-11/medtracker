import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const checkAuth = async () => {
             if (token) {
                // api interceptor handles the header, but we'll fetch the user profile
                await fetchUser();
            } else {
                setLoading(false);
            }
        };
        checkAuth();
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.success) {
                setUser(res.data.data);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log(`[Auth] Attempting login for ${email}`);
            const res = await api.post('/auth/login', { email, password });
            if (res.data && res.data.success) {
                const { token, ...userData } = res.data.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            console.error('[Auth] Login error:', error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await api.post('/auth/register', { name, email, password });
            if (res.data && res.data.success) {
                const { token, ...userData } = res.data.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            console.error('[Auth] Registration error:', error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
