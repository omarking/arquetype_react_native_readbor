/**
 * Servicio de Notificaciones Locales
 * 
 * IMPORTANTE: @notifee/react-native NO funciona con Expo Go.
 * Requiere un Development Build para funcionar.
 * 
 * Instrucciones de setup:
 * 1. Crear un development build: npx expo prebuild
 * 2. Para iOS: cd ios && pod install && cd ..
 * 3. Correr en dispositivo: npx expo run:ios o npx expo run:android
 * 
 * Este archivo contiene la implementación preparada para cuando
 * se configure el development build.
 */

import * as Linking from 'expo-linking';

// Tipos para las notificaciones
interface NotificationPayload {
  jobId: number;
  title: string;
  body: string;
}

// Función para crear deep link de vacante
export function createJobDeepLink(jobId: number): string {
  return Linking.createURL(`vacante/${jobId}`);
}

/**
 * Inicializa el servicio de notificaciones
 * Debe llamarse al inicio de la app
 */
export async function initializeNotifications(): Promise<void> {
  // TODO: Implementar cuando se tenga development build
  // 
  // import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
  // 
  // // Crear canal para Android
  // await notifee.createChannel({
  //   id: 'jobs',
  //   name: 'Vacantes',
  //   importance: AndroidImportance.HIGH,
  // });
  // 
  // // Manejar eventos de notificación
  // notifee.onForegroundEvent(({ type, detail }) => {
  //   if (type === EventType.PRESS && detail.notification?.data?.jobId) {
  //     handleNotificationPress(detail.notification.data.jobId as number);
  //   }
  // });
  // 
  // notifee.onBackgroundEvent(async ({ type, detail }) => {
  //   if (type === EventType.PRESS && detail.notification?.data?.jobId) {
  //     handleNotificationPress(detail.notification.data.jobId as number);
  //   }
  // });
  
  console.log('[Notifications] Inicializado (mock mode - requiere development build)');
}

/**
 * Muestra una notificación local simulando "Nueva vacante para ti"
 */
export async function showJobNotification(payload: NotificationPayload): Promise<void> {
  // TODO: Implementar cuando se tenga development build
  //
  // import notifee from '@notifee/react-native';
  // 
  // await notifee.displayNotification({
  //   title: payload.title,
  //   body: payload.body,
  //   android: {
  //     channelId: 'jobs',
  //     importance: AndroidImportance.HIGH,
  //     pressAction: {
  //       id: 'default',
  //       launchActivity: 'default',
  //     },
  //   },
  //   ios: {
  //     foregroundPresentationOptions: {
  //       badge: true,
  //       sound: true,
  //       banner: true,
  //       list: true,
  //     },
  //   },
  //   data: {
  //     jobId: payload.jobId,
  //   },
  // });
  
  console.log('[Notifications] Notificación simulada:', payload);
}

/**
 * Maneja el tap en una notificación
 * Navega al detalle de la vacante usando deep linking
 */
export function handleNotificationPress(jobId: number): void {
  const deepLink = createJobDeepLink(jobId);
  Linking.openURL(deepLink);
}

/**
 * Obtiene la notificación inicial si la app fue abierta desde una
 * Útil para manejar el caso "quit state"
 */
export async function getInitialNotification(): Promise<NotificationPayload | null> {
  // TODO: Implementar cuando se tenga development build
  //
  // import notifee from '@notifee/react-native';
  // 
  // const initial = await notifee.getInitialNotification();
  // if (initial?.notification?.data?.jobId) {
  //   return {
  //     jobId: initial.notification.data.jobId as number,
  //     title: initial.notification.title || '',
  //     body: initial.notification.body || '',
  //   };
  // }
  
  return null;
}
