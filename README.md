# OCC Jobs - Ejercicio Técnico

Aplicación móvil para búsqueda de vacantes desarrollada con React Native (Expo) y backend en Node.js/Express.

## Requisitos

- Node.js 18+ (recomendado 20 LTS)
- npm
- Para iOS: macOS con Xcode 15+
- Para Android: Android Studio con emulador o dispositivo físico

## Estructura del Monorepo

```
├── app/          # Aplicación Expo (React Native)
├── backend/      # API REST (Node.js + Express)
├── docs/         # Documentación arquitectónica
└── README.md
```

## Inicio Rápido

### 1. Backend

```bash
cd backend
npm install

# Crear archivo de entorno
cp .env.example .env

# Iniciar servidor
npm run dev

# Servidor en http://localhost:3000
```

### 2. App

```bash
cd app
npm install

# Iniciar Expo
npx expo start
```

Para dispositivo físico con Expo Go:
- Escanea el QR con la app Expo Go

Para desarrollo con builds nativos (requerido para notificaciones):
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Credenciales de Prueba

```
Email: test@occ.com.mx
Password: Test1234
```

## Variables de Entorno

### Backend (`backend/.env`)

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
```

### App (`app/.env`)

```env
API_BASE_URL=http://localhost:3000
```

> **Nota**: En dispositivo físico, reemplazar `localhost` por la IP de tu máquina.

## API Endpoints

### Auth
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | /auth/login | No | Login con credenciales mock |
| POST | /auth/logout | Sí | Invalida el token |
| GET | /auth/me | Sí | Datos del usuario autenticado |

### Jobs
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | /jobs | No | Lista paginada con filtros |
| GET | /jobs/:id | No | Detalle de vacante |
| POST | /jobs/:id/apply | Sí | Aplicar a vacante |
| DELETE | /jobs/:id/apply | Sí | Cancelar aplicación |
| POST | /jobs/:id/favorite | Sí | Agregar a favoritos |
| DELETE | /jobs/:id/favorite | Sí | Eliminar de favoritos |

### User
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | /applications | Sí | Mis aplicaciones |
| GET | /favorites | Sí | Mis favoritos |

## Tests

```bash
# Backend
cd backend
npm test

# App
cd app
npm test
```

## Stack Tecnológico

### App
- Expo SDK 54
- React Native 0.81
- TypeScript (strict)
- Expo Router 5 (navegación file-based)
- Zustand (estado global)
- @shopify/flash-list (listas performantes)
- @gorhom/bottom-sheet (detalle de vacante)
- react-native-reanimated (animaciones)
- Zod (validación de tipos)

### Backend
- Node.js + Express
- TypeScript
- jsonwebtoken (JWT)
- Zod (validación)

## Documentación Arquitectónica

Ver carpeta `docs/`:
- [A1 - Arquitectura del Monorepo](docs/A1-arquitectura.md)
- [A2 - Estrategia de Estado y Datos](docs/A2-estado-datos.md)
- [A3 - Navegación y Deep Linking](docs/A3-navegacion-deeplink.md)
- [A4 - Estrategia de Calidad](docs/A4-calidad.md)
- [A5 - Performance](docs/A5-performance.md)

## Notificaciones Locales

Las notificaciones push locales requieren un **Development Build** (no funcionan con Expo Go).

Para habilitarlas:

```bash
cd app
npx expo prebuild
npx expo run:ios  # o run:android
```

La implementación está preparada en `app/src/services/notifications.service.ts`.

## Deep Linking

Scheme configurado: `occ://`

Ejemplo de deep link a vacante:
```
occ://vacante/123
```

Esto abre el Bottom Sheet con el detalle de la vacante #123.
