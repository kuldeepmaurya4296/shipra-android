import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: 'user' | 'pilot';
    whatsappNumber?: string;
    callingNumber?: string;
    aadharNumber?: string;
    panNumber?: string;
    currentAddress?: string;
    permanentAddress?: string;
    otherDetails?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    socialLogin: (email: string, name: string, provider: 'google' | 'whatsapp') => Promise<void>;
    requestOtp: (phone: string) => Promise<void>;
    loginWithOtp: (phone: string, otp: string) => Promise<void>;
    pilotLogin: (email: string, password?: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    refreshUserProfile: () => Promise<void>;
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
        const { token: authToken, user: userData } = response.data;
        await AsyncStorage.setItem('auth_token', authToken);
        setToken(authToken);

        // Fetch full user profile from server to ensure all fields are synced
        try {
            const profileRes = await client.get('/users/me');
            const fullUserData = {
                id: profileRes.data._id || profileRes.data.id,
                ...profileRes.data
            };
            await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
            setUser(fullUserData);
        } catch (e) {
            // Fallback to basic user data if profile fetch fails
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await client.post('/auth/register', { name, email, password });
        const { token: authToken, user: userData } = response.data;
        await AsyncStorage.setItem('auth_token', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
    };

    const socialLogin = async (email: string, name: string, provider: 'google' | 'whatsapp') => {
        const response = await client.post('/auth/social-login', { email, name, provider });
        const { token: authToken, user: userData } = response.data;
        await AsyncStorage.setItem('auth_token', authToken);
        setToken(authToken);

        // Fetch full user profile 
        try {
            const profileRes = await client.get('/users/me');
            const fullUserData = {
                id: profileRes.data._id || profileRes.data.id,
                ...profileRes.data
            };
            await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
            setUser(fullUserData);
        } catch (e) {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        }
    };

    const requestOtp = async (phone: string) => {
        await client.post('/auth/otp-request', { phone });
    };

    const loginWithOtp = async (phone: string, otp: string) => {
        const response = await client.post('/auth/otp-verify', { phone, otp });
        const { token: authToken, user: userData } = response.data;
        await AsyncStorage.setItem('auth_token', authToken);
        setToken(authToken);

        // Fetch full user profile
        try {
            const profileRes = await client.get('/users/me');
            const fullUserData = {
                id: profileRes.data._id || profileRes.data.id,
                ...profileRes.data
            };
            await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
            setUser(fullUserData);
        } catch (e) {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        }
    };

    const pilotLogin = async (email: string, password?: string) => {
        try {
            const response = await client.post('/auth/pilot-login', {
                email,
                password: password || '123456' // Fallback for legacy calls if any
            });
            const { token: authToken, user: userData } = response.data;
            await AsyncStorage.setItem('auth_token', authToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setToken(authToken);
            setUser(userData);
        } catch (error) {
            console.error('Pilot login failed:', error);
            throw error; // Let UI handle error
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        try {
            console.log('[AuthContext] Updating profile with data:', data);

            // Update via backend API
            const response = await client.put('/users/me', data);
            const userData = response.data;

            console.log('[AuthContext] Server response:', userData);

            // Merge with existing user data
            const updatedUser = {
                ...user,
                ...userData,
                // Ensure we use the server's id format
                id: userData.id || userData._id || user?.id
            } as User;

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            console.log('[AuthContext] Profile updated successfully');
        } catch (error: any) {
            console.error('[AuthContext] Profile update failed:', error.response?.data || error.message);
            // Don't silently fallback - throw the error so user knows update failed
            throw error;
        }
    };

    // Fetch fresh user data from server
    const refreshUserProfile = async () => {
        try {
            const response = await client.get('/users/me');
            const userData = response.data;

            if (userData) {
                const refreshedUser = {
                    id: userData._id || userData.id,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    whatsappNumber: userData.whatsappNumber,
                    callingNumber: userData.callingNumber,
                    aadharNumber: userData.aadharNumber,
                    panNumber: userData.panNumber,
                    currentAddress: userData.currentAddress,
                    permanentAddress: userData.permanentAddress,
                    otherDetails: userData.otherDetails,
                    role: user?.role
                } as User;

                await AsyncStorage.setItem('user', JSON.stringify(refreshedUser));
                setUser(refreshedUser);
                console.log('[AuthContext] User profile refreshed from server');
            }
        } catch (error) {
            console.warn('[AuthContext] Failed to refresh user profile:', error);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, socialLogin, requestOtp, loginWithOtp, pilotLogin, updateProfile, refreshUserProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
