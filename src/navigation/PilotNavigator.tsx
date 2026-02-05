import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PilotHomeScreen from '../screens/PilotHomeScreen';
import PilotProfileScreen from '../screens/PilotProfileScreen';
import PilotRideDetailsScreen from '../screens/PilotRideDetailsScreen';
import { Home, User } from 'lucide-react-native';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function PilotNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.mutedForeground,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={PilotHomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    tabBarLabel: 'Home'
                }}
            />
            <Tab.Screen
                name="Profile"
                component={PilotProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                    tabBarLabel: 'Profile'
                }}
            />
            <Tab.Screen
                name="PilotRideDetails"
                component={PilotRideDetailsScreen}
                options={{
                    tabBarButton: () => null, // Keep hidden from list, but allow navigation to it
                    title: 'Ride Details'
                }}
            />
        </Tab.Navigator>
    );
}
