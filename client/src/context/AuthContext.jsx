import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Verify token and get user info
            const userData = JSON.parse(localStorage.getItem('user') || 'null');
            setUser(userData);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            setUser(data);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
            });

            setUser(data);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
