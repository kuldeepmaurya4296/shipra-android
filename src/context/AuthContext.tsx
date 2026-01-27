import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    updateProfile: (name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            const storedUser = await AsyncStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to load storage data');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await client.post('/auth/login', { email, password });
        const { token, user: userData } = response.data;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await client.post('/auth/register', { name, email, password });
        const { token, user: userData } = response.data;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
    };

    const updateProfile = async (name: string) => {
        const response = await client.put('/users/me', { name });
        const userData = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
