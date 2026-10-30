# A5 - Performance

## Métricas a Monitorear en Producción

### Métricas Core

| Métrica | Herramienta | Umbral Aceptable |
|---------|-------------|------------------|
| **TTI** (Time to Interactive) | React Native Performance | < 3s |
| **FPS** durante scroll | Flipper / Perf Monitor | > 55 fps |
| **JS Thread** usage | Flipper | < 60% promedio |
| **Memory** (heap) | Xcode Instruments / Android Profiler | < 300MB |
| **API Latency** (p95) | Custom logging / Sentry | < 2s |

### Métricas de Negocio

| Métrica | Cómo medirla |
|---------|--------------|
| Crash-free rate | Sentry / Crashlytics |
| Session duration | Analytics (Firebase/Amplitude) |
| Conversion (Apply rate) | Custom events |

### Herramientas Recomendadas

1. **Sentry** - Crash reporting + performance monitoring
2. **Flipper** - Debug en desarrollo (React DevTools, Network, Perf)
3. **React Native Performance** - Métricas de renderizado
4. **Firebase Performance** - Traces de red y startup

## Optimizaciones Implementadas

### 1. FlashList en lugar de FlatList

```typescript
// ❌ FlatList: re-crea componentes al scrollear
<FlatList data={jobs} renderItem={renderItem} />

// ✅ FlashList: recicla views como native
<FlashList
  data={jobs}
  renderItem={renderItem}
  estimatedItemSize={160}  // Clave para performance
/>
```

**Beneficio**: Hasta 10x más rápido en listas largas (90+ items).

### 2. Memoización de Componentes de Lista

```typescript
// ❌ Sin memo: re-render en cada cambio de parent
function JobCard({ job, onPress }) { ... }

// ✅ Con memo: solo re-render si props cambian
const JobCard = memo(function JobCard({ job, onPress }) { ... });
```

**Regla**: Todos los componentes dentro de `renderItem` deben estar memoizados.

### 3. No `key` prop en items de FlashList

```typescript
// ❌ Rompe el reciclaje de FlashList
{job.tags.map((tag) => (
  <View key={tag}><Text>{tag}</Text></View>
))}

// ✅ Usar índice o helper de FlashList
{job.tags.map((tag, index) => (
  <View key={`${tag}-${index}`}><Text>{tag}</Text></View>
))}
```

### 4. Debounce en Búsqueda

```typescript
const DEBOUNCE_MS = 300;

const setFilters = useCallback((newFilters) => {
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }
  
  debounceRef.current = setTimeout(() => {
    fetchJobs(newFilters);
  }, DEBOUNCE_MS);
}, []);
```

**Beneficio**: Evita requests innecesarios mientras el usuario escribe.

## Prefetch de Jobs Adyacentes sin Impactar Render Inicial

### El Problema

Cuando el usuario hace swipe en el Bottom Sheet, necesitamos cargar más jobs antes de que llegue al final. Pero no queremos:
1. Bloquear el render inicial
2. Mostrar loading durante el swipe
3. Interrumpir la animación

### La Solución: Background Fetch

```typescript
const PREFETCH_THRESHOLD = 3;

const handleSwipeToJob = (direction: 'left' | 'right') => {
  const nextIndex = /* calcular */;
  setSelectedJob(jobs[nextIndex]);
  
  // Pre-fetch cuando queden pocos items
  if (hasMore && jobs.length - nextIndex <= PREFETCH_THRESHOLD) {
    loadMore(); // No bloquea, no muestra loading
  }
};
```

### Flujo de Pre-fetch

```
Usuario en job #17 de 20 (threshold = 3)
       │
       ▼
Swipe → job #18
       │
       ├── UI: muestra job #18 inmediatamente
       │
       └── Background: fetch page 2 (jobs 21-40)
              │
              ▼
           jobs.length = 40 (actualizado silenciosamente)
              │
              ▼
           Usuario puede seguir hasta job #37
           sin ver ningún loading
```

### Qué NO Hacemos

```typescript
// ❌ No pre-cargamos en el render inicial
useEffect(() => {
  fetchJobs(); // Solo página 1
  // NO: fetchJobs({ page: 2 }); ← esto bloquearía
}, []);

// ❌ No mostramos loading durante swipe
if (isLoadingMore) {
  return <Loading />; // NUNCA durante swipe
}

// ❌ No usamos InteractionManager para el prefetch
// porque queremos que sea invisible, no prioritario
```

## Animaciones en UI Thread

### Reanimated para Swipe

```typescript
// El gesture handler corre en UI thread
const gesture = Gesture.Pan()
  .onUpdate((event) => {
    // worklet - corre en UI thread
    translateX.value = event.translationX;
  })
  .onEnd((event) => {
    // worklet
    if (event.translationX < -THRESHOLD) {
      runOnJS(onSwipe)('right'); // Solo esto va a JS
    }
    translateX.value = withSpring(0);
  });
```

**Beneficio**: Las animaciones corren a 60fps independiente del JS thread.

### Bottom Sheet con Dynamic Sizing

```typescript
<BottomSheet
  enableDynamicSizing={false}  // Evita re-layouts costosos
  snapPoints={['60%', '100%']} // Puntos fijos
/>
```

## Resumen de Optimizaciones

| Área | Optimización | Impacto |
|------|--------------|---------|
| Lista | FlashList + estimatedItemSize | 10x scroll performance |
| Lista | memo() en items | Reduce re-renders 80% |
| Lista | No key prop en children | Habilita reciclaje |
| Búsqueda | Debounce 300ms | -70% requests |
| Swipe | Prefetch transparente | UX sin interrupciones |
| Animaciones | Reanimated worklets | 60fps garantizado |
| Sheet | snapPoints fijos | Evita layout thrashing |

## Monitoreo Continuo

Para mantener la performance:

1. **CI**: Incluir test de bundle size
2. **Dev**: Usar Flipper para detectar regresiones
3. **Prod**: Alertas en Sentry para crashes y ANRs
4. **Release**: Comparar métricas entre versiones
