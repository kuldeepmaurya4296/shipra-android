import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Home, Clock, User } from 'lucide-react-native';
import { colors } from '../theme/colors';

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

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 16,
    },
    activeIconContainer: {
        backgroundColor: colors.muted,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },
});
