# A1 - Arquitectura del Monorepo

## Estructura General

```
occ-lead-ejercicio/
├── app/                          # Aplicación móvil Expo
│   ├── src/
│   │   ├── app/                  # Rutas (Expo Router file-based)
│   │   │   ├── _layout.tsx       # Root layout
│   │   │   ├── sign-in.tsx       # Pantalla de login
│   │   │   └── (app)/            # Grupo de rutas protegidas
│   │   │       ├── _layout.tsx   # Layout con guard de auth
│   │   │       ├── index.tsx     # Job Search
│   │   │       └── activities.tsx# Mis actividades
│   │   ├── components/           # Componentes UI reutilizables
│   │   ├── hooks/                # Custom hooks con lógica de negocio
│   │   ├── services/             # Capa de comunicación con API
│   │   ├── stores/               # Estado global (Zustand)
│   │   ├── schemas/              # Validación Zod + tipos
│   │   └── config/               # Configuración de entorno
│   ├── assets/                   # Recursos estáticos
│   ├── __tests__/                # Tests unitarios
│   └── package.json
│
├── backend/                      # API REST Node.js
│   ├── src/
│   │   ├── routes/               # Endpoints Express
│   │   ├── middleware/           # Auth, validación
│   │   ├── data/                 # Store en memoria + seed
│   │   ├── schemas/              # Validación Zod
│   │   └── config/               # Variables de entorno
│   ├── __tests__/                # Tests unitarios
│   └── package.json
│
├── docs/                         # Documentación arquitectónica
│   ├── A1-arquitectura.md        # Este documento
│   ├── A2-estado-datos.md        # Estrategia de estado
│   ├── A3-navegacion-deeplink.md # Navegación
│   ├── A4-calidad.md             # Testing y CI
│   └── A5-performance.md         # Optimizaciones
│
├── README.md                     # Instrucciones de setup
└── .env.example                  # Variables de entorno
```

## Justificación del Patrón Elegido

### App (Feature-Based con Expo Router)

El patrón elegido combina **feature-based organization** con **file-based routing**:

1. **File-based routing (Expo Router)**: Las rutas están definidas por la estructura de carpetas en `src/app/`. Esto elimina la necesidad de archivos de configuración de navegación separados y hace que la estructura de navegación sea predecible.

2. **Separación por responsabilidad**:
   - `components/` → UI pura, sin lógica de negocio
   - `hooks/` → Lógica de negocio encapsulada y reutilizable
   - `services/` → Comunicación con APIs externas
   - `stores/` → Estado global que persiste entre pantallas
   - `schemas/` → Contratos de datos compartidos con el backend

### Backend (Layered Architecture)

Arquitectura en capas simple pero efectiva para una API REST:

1. **Routes** → Definición de endpoints y orquestación
2. **Middleware** → Validación, autenticación
3. **Data** → Acceso a datos (en memoria para este ejercicio)
4. **Schemas** → Validación de entrada/salida con Zod

## Criterios de Decisión: Compartido vs Encapsulado

### Compartido (nivel monorepo)

- **Tipos de respuesta API**: Los schemas de Zod definen el contrato entre frontend y backend
- **Códigos de error**: Estandarizados para manejo consistente
- **Variables de entorno**: Estructura común en `.env.example`

### Encapsulado por feature

- **Componentes de UI**: Específicos de cada pantalla
- **Lógica de hooks**: Aislada por funcionalidad (useJobs, useActivities)
- **Stores**: Separados por dominio (auth, jobs)

## Por Qué No Usamos Otras Alternativas

### No usamos npm workspaces / Turborepo

Para este alcance, agregar herramientas de monorepo introduce complejidad sin beneficio real. Ambos proyectos (app y backend) tienen dependencias completamente independientes.

### No usamos Redux

Zustand ofrece la misma funcionalidad con menos boilerplate. La integración con AsyncStorage para persistencia es directa y el modelo mental es más simple.

### No usamos React Query / TanStack Query

Aunque es excelente para cache de datos, para este ejercicio la lógica de cache manual con estado optimista es suficiente y muestra mejor comprensión de los fundamentos.
