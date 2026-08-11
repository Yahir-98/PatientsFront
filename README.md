# Gestión de Pacientes (Angular)

Aplicación front-end en **Angular 16** + **PrimeNG** para consumir la API de pacientes.

## Requisitos

- Node.js 18+
- API backend en ejecución (por defecto `http://localhost:53361`)

## Instalación

```bash
npm install
```

## Configuración de la API

La URL local está en:

- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

```ts
apiUrl: 'http://localhost:53361/api'
```

También puedes usar el proxy (`proxy.conf.json`) para evitar CORS en local. El proxy redirige `/api` hacia `http://localhost:53361`.

Si usas proxy, cambia `apiUrl` a:

```ts
apiUrl: '/api'
```

## Ejecución

```bash
npm start
```

Abre `http://localhost:4200`.

## Funcionalidades

### Pacientes
- **Lista**: tabla paginada (server-side), filtros por `name` y `documentNumber`, acciones Ver / Editar / Eliminar
- **Formulario**: crear y editar con validaciones UI
- **Detalle**: datos del paciente + citas asociadas (solo lectura)
- **Exportar CSV** (adicional): pacientes creados después de una fecha

### Infraestructura
- `PatientService` con `HttpClient`
- Interceptor global de errores con toast (`message` + `details[]`)
- Confirmación antes de eliminar
- Loading en botones/tablas

## Pruebas unitarias (Jasmine + Karma)

El proyecto usa **Jasmine** como framework de assertions y **Karma** como test runner.

```bash
# Primera vez: instalar Chromium de Puppeteer
npm run test:install-browser

# Modo watch (abre Chrome)
npm test

# CI / una sola ejecución (Chrome Headless + coverage)
npm run test:ci
```

El reporte de cobertura queda en `coverage/patients/`.

Specs incluidos:
- `PatientService` (HttpClient + unwrap de `ApiResponse`)
- `PatientListComponent`
- `PatientFormComponent`
- `ErrorInterceptor`
- `AppComponent`

## Arquitectura

```
src/app/
  core/
    models/             # DTOs y contratos de API
    services/           # PatientService (HttpClient)
    interceptors/       # manejo global de errores
  features/
    patients/
      pages/            # lista, formulario, detalle
      patients.module.ts
      patients-routing.module.ts
src/environments/       # configuración API
```

### Decisiones técnicas
- `core` concentra infraestructura compartida (servicios, modelos, interceptors)
- Módulo feature `PatientsModule` con lazy loading solo para UI
- Paginación server-side alineada con `page` / `pageSize` de la API
- Manejo de errores centralizado en interceptor para feedback consistente
- PrimeNG para tabla, formularios, diálogos y toasts
- Respuestas tipadas con `ApiResponse<T>` y unwrap de `data`
## Build

```bash
npm run build
```
