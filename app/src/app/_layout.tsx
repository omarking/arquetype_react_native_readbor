import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isHydrated, token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    async function validateSession() {
      if (!isHydrated) return;

      if (token) {
        const result = await authService.getMe();
        if (result.ok) {
          setAuth(result.data, token);
        } else {
          clearAuth();
        }
      }

      await SplashScreen.hideAsync();
    }

    validateSession();
  }, [isHydrated, token, setAuth, clearAuth]);

  if (!isHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0066CC' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="sign-in"
          options={{
            title: 'Iniciar Sesión',
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
