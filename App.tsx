/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NavigationBar from './src/components/NavigationBar';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState('splash');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onNext={() => setCurrentScreen('login')} />;
      case 'login':
        return <LoginScreen onNext={() => setCurrentScreen('home')} />;
      case 'home':
        return <HomeScreen onNext={() => setCurrentScreen('booking')} />;
      case 'history':
        return (
          <View style={styles.center}>
            <Text>History Screen</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.center}>
            <Text>Profile Screen</Text>
          </View>
        );
      default:
        // For now default to Home for other screens
        return <HomeScreen onNext={() => setCurrentScreen('home')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {renderScreen()}
        <NavigationBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
