import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function AppLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Vacantes',
        }}
      />
      <Stack.Screen
        name="activities"
        options={{
          title: 'Mis Actividades',
        }}
      />
    </Stack>
  );
}
