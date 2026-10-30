# A2 - Estrategia de Estado y Datos

## Sesión de Usuario con JWT

### Flujo de Autenticación

```
┌──────────────┐      POST /auth/login      ┌──────────────┐
│              │ ────────────────────────► │              │
│    App       │                            │   Backend    │
│              │ ◄──────────────────────── │              │
└──────────────┘   { user, token (JWT) }    └──────────────┘
       │
       │ Almacena en Zustand + AsyncStorage
       ▼
┌──────────────────────────────────────────────────────────┐
│                     Auth Store                            │
│  - user: User | null                                      │
│  - token: string | null                                   │
│  - isAuthenticated: boolean                               │
│  - isHydrated: boolean (para splash screen)               │
└──────────────────────────────────────────────────────────┘
```

### Validación de Sesión al Iniciar

1. App inicia → Zustand hidrata desde AsyncStorage
2. Si hay token → GET /auth/me para validar
3. Si válido → Mantiene sesión
4. Si inválido (401) → Limpia store y redirige a login

### Interceptor de Axios

```typescript
// Inyecta JWT automáticamente
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Maneja expiración de token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);
```

## Caché de Vacantes

### Estrategia: No Cache + Fetch on Demand

Para este ejercicio, no implementamos cache persistente de vacantes porque:

1. Los datos cambian frecuentemente (nuevas vacantes, salarios actualizados)
2. La paginación hace que el cache sea complejo de invalidar
3. El seed genera datos aleatorios en cada restart del backend

### Invalidación Selectiva

El store de jobs mantiene Sets de `applications` y `favorites` que se actualizan localmente después de cada acción:

```typescript
// Estado optimista inmediato
addApplication: (jobId) => set((state) => ({
  applications: new Set([...state.applications, jobId]),
}));
```

## Estado Optimista en Apply y Favorito

### Flujo de Aplicar a Vacante

```
Usuario presiona "Aplicar"
       │
       ▼
┌─────────────────────────────────────┐
│ 1. UI muestra estado "Aplicado"     │ ← Feedback inmediato
│    (botón deshabilitado, check)     │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 2. POST /jobs/:id/apply en background│
└─────────────────────────────────────┘
       │
       ├─── Éxito (201) → Mantiene estado
       │
       └─── Error (409 ya aplicado) → Muestra mensaje, 
            mantiene estado
       │
       └─── Error (401) → Redirige a login, 
            revierte estado
```

### Implementación

```typescript
const handleApply = async () => {
  // 1. Actualización optimista
  addApplication(job.id);
  
  // 2. Request al servidor
  const result = await jobsService.applyToJob(job.id);
  
  // 3. Revertir si falla
  if (!result.ok) {
    if (result.error.code === 'TOKEN_EXPIRED') {
      removeApplication(job.id);
      router.push('/sign-in');
    }
  }
};
```

## Prefetch de Jobs Adyacentes para Swipe

### Estrategia: Pre-carga Transparente

Cuando el usuario hace swipe en el Bottom Sheet y se acerca al final de la página actual, cargamos la siguiente silenciosamente:

```typescript
const PREFETCH_THRESHOLD = 3; // Jobs antes del final

const handleSwipeToJob = (direction: 'left' | 'right') => {
  // Navegar al job
  const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
  setSelectedJob(jobs[nextIndex]);
  
  // Pre-cargar si está cerca del final
  if (hasMore && jobs.length - nextIndex <= PREFETCH_THRESHOLD) {
    loadMore(); // Carga silenciosa en background
  }
};
```

### Por Qué No Pre-cargamos Todo

1. **Memoria**: 90+ jobs con descripción ocupan espacio significativo
2. **Red**: El usuario probablemente no verá todos
3. **UX**: La paginación transparente da la ilusión de lista infinita

## Justificación de Herramientas

### Zustand vs Redux

| Aspecto | Zustand | Redux |
|---------|---------|-------|
| Boilerplate | Mínimo | Alto |
| Persistencia | `persist` middleware | redux-persist |
| Curva de aprendizaje | Baja | Media-Alta |
| DevTools | Soportado | Nativo |
| Tamaño del bundle | ~3KB | ~25KB |

Zustand es suficiente para el alcance de esta app y reduce la complejidad.

### Zod vs io-ts vs Yup

| Aspecto | Zod | io-ts | Yup |
|---------|-----|-------|-----|
| TypeScript-first | ✅ | ✅ | ❌ |
| Inferencia de tipos | `z.infer<>` | Requiere codec | Manual |
| API de validación | Intuitiva | Funcional | OOP |
| Ecosistema React | Bueno | Limitado | Excelente |

Zod permite definir el schema una vez y obtener validación runtime + tipos TS automáticamente.
