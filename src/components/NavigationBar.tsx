import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Home, Clock, User } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { styles } from './NavigationBar.styles';

interface NavigationBarProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}

const { width } = Dimensions.get('window');

export default function NavigationBar({ currentScreen, onNavigate }: NavigationBarProps) {
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    const isVisible = ['home', 'history', 'profile'].includes(currentScreen);

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => onNavigate(item.id)}
                            style={styles.item}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                                <Icon
                                    size={24}
                                    color={isActive ? colors.primary : colors.mutedForeground}
                                />
                            </View>
                            {isActive && (
                                <Text style={styles.label}>{item.label}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
