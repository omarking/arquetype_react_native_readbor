import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  apiBaseUrl: (extra.apiBaseUrl as string) || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
};
