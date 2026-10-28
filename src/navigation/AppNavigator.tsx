import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import BookFormScreen from '../screens/BookFormScreen';
import { useBooks } from '../context/BookContext';
import { colors, ui } from '../constants/theme';
import { RootStackParamList } from '../types';

// Stack quản lý ba màn hình và thao tác quay lại.
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoading } = useBooks();
  // Đọc xong dữ liệu đã lưu mới cho người dùng thao tác.
  if (isLoading) {
    return (
      <View style={ui.content}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Quản lý thư viện' }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: 'Chi tiết sách' }}
      />
      <Stack.Screen
        name="BookForm"
        component={BookFormScreen}
        options={{ title: 'Thông tin sách' }}
      />
    </Stack.Navigator>
  );
}
