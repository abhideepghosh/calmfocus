import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.light.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="home/index" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="locker/index"
          options={{
            headerShown: true,
            title: 'App Locker',
            presentation: 'modal',
            headerStyle: { backgroundColor: Colors.light.background },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="browser/index"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal'
          }}
        />
      </Stack>
    </View>
  );
}
