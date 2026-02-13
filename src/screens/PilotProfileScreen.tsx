import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './PilotProfileScreen.styles';

export default function PilotProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();

    return (
        <LinearGradient
            colors={[colors.background, colors.background, '#f3f4f6']}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pilot Profile</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'Pilot'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>VERIFIED PILOT</Text>
                    </View>
                </View>

                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('History')}
                    >
                        <Text style={styles.menuText}>Ride History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PilotEditProfile')}
                    >
                        <Text style={styles.menuText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={logout}
                    >
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}
