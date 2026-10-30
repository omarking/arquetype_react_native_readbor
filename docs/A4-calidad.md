# A4 - Estrategia de Calidad

## Testing por Capa

### Backend

| Capa | Herramienta | Qué se prueba |
|------|-------------|---------------|
| Unit | Jest + ts-jest | Store, validación, helpers |
| Integration | Supertest (futuro) | Endpoints completos |

**Archivos de test:**
- `__tests__/store.test.ts` - Store en memoria
- `__tests__/auth.test.ts` - Validación de credenciales

### App

| Capa | Herramienta | Qué se prueba |
|------|-------------|---------------|
| Unit | Jest + jest-expo | Hooks, stores, schemas |
| Component | @testing-library/react-native (futuro) | Renderizado de componentes |

**Archivos de test:**
- `__tests__/stores/auth.store.test.ts` - Auth store
- `__tests__/hooks/useJobs.test.ts` - Lógica de filtrado
- `__tests__/services/api.test.ts` - Validación Zod

## Ejecución de Tests

```bash
# Backend
cd backend
npm test           # Una vez
npm run test:watch # Watch mode

# App
cd app
npm test           # Una vez
npm run test:watch # Watch mode
```

## Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato (no afecta código) |
| `refactor` | Refactoring sin cambio funcional |
| `test` | Agregar o modificar tests |
| `chore` | Mantenimiento, dependencias |

### Scopes

| Scope | Área |
|-------|------|
| `app` | Código de la aplicación móvil |
| `backend` | Código del servidor |
| `docs` | Documentación |

### Ejemplos

```bash
feat(app): add job search filters
fix(backend): handle null salary in sort
docs: add A4 quality strategy document
test(app): add auth store unit tests
chore(backend): update express to 4.21
```

## Estrategia de Branching

### Modelo: GitHub Flow Simplificado

```
main
  │
  ├── feat/job-search ──────────────── PR ──┐
  │                                         │
  ├── feat/bottom-sheet ─────────────── PR ──┤
  │                                         │
  ├── fix/auth-redirect ─────────────── PR ──┤
  │                                         │
  └─────────────────────────────────────────┴── main
```

### Reglas

1. **main** siempre es deployable
2. Features en branches `feat/<nombre>`
3. Fixes en branches `fix/<nombre>`
4. PRs requieren al menos 1 review
5. Squash merge al integrar

## Requisitos para Aprobar un PR

### Checklist Obligatorio

- [ ] **Tests pasan**: `npm test` sin errores
- [ ] **TypeScript compila**: `npm run typecheck` sin errores
- [ ] **Sin console.log**: Excepto en desarrollo intencional
- [ ] **Commits limpios**: Siguiendo convención
- [ ] **Documentación**: Actualizada si cambia comportamiento
- [ ] **Review aprobado**: Al menos 1 aprobación

### Verificación Automática (CI recomendado)

```yaml
# .github/workflows/ci.yml (ejemplo)
name: CI
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm test

  app:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
```

## Linting

### Backend

```json
// .eslintrc (recomendado)
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### App

```json
// .eslintrc (recomendado)
{
  "extends": [
    "expo",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

## Cobertura de Tests

### Mínimo Esperado

| Módulo | Cobertura Mínima |
|--------|------------------|
| Auth Store | 80% |
| useJobs Hook | 70% |
| API Service | 70% |
| Backend Store | 80% |

### Generación de Reporte

```bash
# Backend
npm test -- --coverage

# App
npm test -- --coverage
```

## Buenas Prácticas Adoptadas

1. **No `any`**: TypeScript strict mode habilitado
2. **Validación en runtime**: Zod para toda respuesta de API
3. **Manejo de errores**: Todos los endpoints retornan formato estándar
4. **Estados de loading/error**: Todas las pantallas los manejan
5. **Accesibilidad**: Labels en inputs, hints para screen readers
