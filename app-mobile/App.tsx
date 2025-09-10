import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import NavigationRoot from './src/navigation';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/Authcontext';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <NavigationRoot>
          <AppNavigator />
        </NavigationRoot>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // fundo consistente com tema
  },
});
