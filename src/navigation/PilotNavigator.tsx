import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import PilotHomeScreen from '../screens/PilotHomeScreen';
import PilotProfileScreen from '../screens/PilotProfileScreen';
import PilotRideDetailsScreen from '../screens/PilotRideDetailsScreen';
import PilotHistoryScreen from '../screens/PilotHistoryScreen';
import PilotEditProfileScreen from '../screens/PilotEditProfileScreen';
import SOSScreen from '../screens/SOSScreen';
import { Home, User, Clock } from 'lucide-react-native';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PilotTabs() {
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
                name="History"
                component={PilotHistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
                    tabBarLabel: 'History'
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
        </Tab.Navigator>
    );
}

export default function PilotNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PilotTabs" component={PilotTabs} />
            <Stack.Screen name="PilotEditProfile" component={PilotEditProfileScreen} />
            {/* <Stack.Screen name="SOS" component={SOSScreen} /> */}
            <Stack.Screen name="PilotRideDetails" component={PilotRideDetailsScreen} />
        </Stack.Navigator>
    );
}
