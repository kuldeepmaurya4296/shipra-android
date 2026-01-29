import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BookingScreen from './src/screens/BookingScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RideStatusScreen from './src/screens/RideStatusScreen';
import RideInProgressScreen from './src/screens/RideInProgressScreen';
import RideSummaryScreen from './src/screens/RideSummaryScreen';
import SOSScreen from './src/screens/SOSScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import DiagnosisScreen from './src/screens/DiagnosisScreen';
import ServiceOrderScreen from './src/screens/ServiceOrderScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  History: undefined;
  Profile: undefined;
  Booking: { from: string; to: string };
  RideStatus: { bookingId: string };
  RideInProgress: { bookingId: string };
  RideSummary: { bookingId: string };
  SOS: { bookingId: string };
  Diagnosis: { bookingId: string };
  ServiceOrder: { type: 'maintenance' | 'fuel'; bookingId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const RootStack = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Splash"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="RideStatus" component={RideStatusScreen} />
            <Stack.Screen name="RideInProgress" component={RideInProgressScreen} />
            <Stack.Screen name="RideSummary" component={RideSummaryScreen} />
            <Stack.Screen name="SOS" component={SOSScreen} />
            <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
            <Stack.Screen name="ServiceOrder" component={ServiceOrderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
