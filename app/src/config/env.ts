import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || (extra.apiBaseUrl as string) || 'http://localhost:3000',
};
