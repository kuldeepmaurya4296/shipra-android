import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import NavigationBar from '../components/NavigationBar';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { User, LogOut, ChevronRight, Settings, Edit2, Check, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [updating, setUpdating] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        setUpdating(true);
        try {
            await updateProfile(newName);
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const menuItems = [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logout', label: 'Logout', icon: LogOut, color: '#ef4444' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <User size={40} color={colors.primary} />
                    </View>

                    {isEditing ? (
                        <View style={styles.editRow}>
                            <TextInput
                                style={styles.editInput}
                                value={newName}
                                onChangeText={setNewName}
                                autoFocus
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity onPress={handleUpdateName} disabled={updating}>
                                    {updating ? <ActivityIndicator size="small" color={colors.primary} /> : <Check size={20} color={colors.success} />}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsEditing(false)}>
                                    <X size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Edit2 size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>Premium</Text>
                        <Text style={styles.statLabel}>Membership</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Birds</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => item.id === 'logout' ? handleLogout() : null}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIcon, item.color ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : null]}>
                                    <item.icon size={20} color={item.color || colors.primary} />
                                </View>
                                <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                                    {item.label}
                                </Text>
                            </View>
                            <ChevronRight size={20} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <NavigationBar
                currentScreen="profile"
                onNavigate={(screen) => {
                    if (screen === 'home') navigation.navigate('Home');
                    if (screen === 'history') navigation.navigate('History');
                    if (screen === 'profile') navigation.navigate('Profile');
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(79, 70, 229, 0.2)',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    editInput: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
        paddingVertical: 8,
        minWidth: 150,
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    userEmail: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    statLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: colors.foreground,
        fontWeight: '600',
    },
});
