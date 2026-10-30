# OCC Jobs - Ejercicio Técnico

Aplicación móvil para búsqueda de vacantes desarrollada con React Native (Expo) y backend en Node.js/Express.

## Requisitos

- Node.js 18+ (recomendado 20 LTS)
- npm
- iOS: macOS con Xcode 16 (Xcode 17/27 puede tener incompatibilidades con react-native-reanimated)
- Android: Android Studio con emulador o dispositivo físico
- Expo Go instalado en dispositivo físico (opcional)

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

# Crear archivo de entorno
cp .env.example .env

# Iniciar Expo
npx expo start
```

## Configuración para Dispositivo Físico (Expo Go)

Para probar en un iPhone/Android físico con Expo Go:

1. **Obtén tu IP local:**
   ```bash
   # macOS/Linux
   ipconfig getifaddr en0
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. **Actualiza `app/.env`:**
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:3000
   ```
   Ejemplo: `http://192.168.100.7:3000`

3. **Asegúrate que:**
   - Tu dispositivo y computadora estén en la misma red WiFi
   - El backend esté corriendo (`npm run dev` en `/backend`)
   - Expo Go esté instalado desde App Store / Play Store

4. **Inicia con cache limpio:**
   ```bash
   cd app
   npx expo start --clear
   ```

5. **Escanea el QR** con la cámara (iOS) o Expo Go (Android)

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
# Para emulador/simulador:
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Para dispositivo físico (reemplaza con tu IP):
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000
```

> **Importante**: Las variables de entorno en Expo deben tener el prefijo `EXPO_PUBLIC_` para ser accesibles en el cliente.

## Ejecución con Builds Nativos

Para desarrollo con builds nativos (requerido para notificaciones):

```bash
cd app

# Generar proyecto nativo
npx expo prebuild --platform ios

# Compilar y ejecutar
npx expo run:ios --device
```

> **Nota**: Xcode 17 (27.x) puede presentar errores de compilación con `fmt`/`folly`. Se recomienda usar Xcode 16.x.

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
# Backend (15 tests)
cd backend
npm test

# App (24 tests)
cd app
npm test
```

## Stack Tecnológico

### App
- Expo SDK 58
- React Native 0.88
- TypeScript (strict)
- Expo Router (navegación file-based)
- Zustand (estado global con persistencia)
- @shopify/flash-list (listas performantes)
- @gorhom/bottom-sheet v5 (detalle de vacante)
- react-native-reanimated (animaciones)
- Zod (validación de schemas)

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

## Deep Linking

Scheme configurado: `occ://`

```bash
# Probar deep link a vacante
npx uri-scheme open "occ://vacante/1" --ios
```

## Troubleshooting

### Network Error en dispositivo físico
- Verifica que `EXPO_PUBLIC_API_BASE_URL` en `app/.env` tenga tu IP local
- Confirma que backend esté corriendo
- Reinicia Expo con `npx expo start --clear`

### Error de Xcode con fmt/folly
- Usa Xcode 16.x en lugar de 17.x
- O prueba con Expo Go en lugar de build nativo

### Metro bundler no inicia
```bash
cd app
rm -rf node_modules .expo
npm install
npx expo start --clear
```
