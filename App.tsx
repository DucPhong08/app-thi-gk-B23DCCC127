import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BookProvider } from './src/context/BookContext';
import AppNavigator from './src/navigation/AppNavigator';

// Khởi động app: vùng an toàn, dữ liệu sách dùng chung và chuyển màn hình.
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <BookProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </BookProvider>
    </SafeAreaProvider>
  );
}
