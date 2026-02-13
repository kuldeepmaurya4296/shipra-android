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
import RideReceiptScreen from './src/screens/RideReceiptScreen';
import SOSScreen from './src/screens/SOSScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import DiagnosisScreen from './src/screens/DiagnosisScreen';
import ServiceOrderScreen from './src/screens/ServiceOrderScreen';
import PilotOtpScreen from './src/screens/PilotOtpScreen';
import PilotNavigator from './src/navigation/PilotNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Login: { userType?: 'pilot' }; // Updated to support params
  Register: undefined;
  PilotOtp: { email: string };
  Home: undefined;
  History: undefined;
  Profile: undefined;
  Booking: {
    from: string;
    to: string;
    fromCoords?: { latitude: number; longitude: number };
    toCoords?: { latitude: number; longitude: number };

    stops?: { address: string; coords: { latitude: number; longitude: number } }[];
  };
  RideStatus: { bookingId: string; otp?: string; initialData?: any };
  RideInProgress: { bookingId: string };
  RideSummary: { bookingId: string };
  SOS: { bookingId: string };
  Diagnosis: { bookingId: string };
  ServiceOrder: { type: 'maintenance' | 'fuel'; bookingId: string };
  RideReceipt: { booking: any };
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

  // If user is logged in
  if (user) {
    if (user.role === 'pilot') {
      return (
        <NavigationContainer>
          <PilotNavigator />
        </NavigationContainer>
      );
    }

    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#fff' }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="RideStatus" component={RideStatusScreen} />
          <Stack.Screen name="RideInProgress" component={RideInProgressScreen} />
          {/* RideSummary removed */}
          <Stack.Screen name="SOS" component={SOSScreen} />
          <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
          <Stack.Screen name="ServiceOrder" component={ServiceOrderScreen} />
          <Stack.Screen name="RideReceipt" component={RideReceiptScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // If not logged in
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PilotOtp" component={PilotOtpScreen} />
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
