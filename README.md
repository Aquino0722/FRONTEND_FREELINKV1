# FreeLink Frontend

Frontend SaaS de FreeLink construido con Next.js 15, TypeScript estricto, Tailwind CSS, shadcn/ui, TanStack Query, Axios, Framer Motion, React Hook Form, Zod y MSW.

## Ejecutar en modo mock

```bash
npm install
cp .env.example .env.local
npm run dev
```

En Windows PowerShell, usa `Copy-Item .env.example .env.local`.

Abre `http://localhost:3000/login` y utiliza cualquiera de las cuentas:

| Rol | Usuario | Clave |
| --- | --- | --- |
| Cliente | `cliente@freelink.dev` | `Demo123!` |
| Freelancer | `freelancer@freelink.dev` | `Demo123!` |
| Administrador | `admin@freelink.dev` | `Demo123!` |

## Escenarios MSW

Configura `.env.local`:

```env
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:5021/api
NEXT_PUBLIC_MOCK_SCENARIO=default
NEXT_PUBLIC_MOCK_DELAY=650
```

`NEXT_PUBLIC_MOCK_SCENARIO` soporta:

- `default`: datos completos y mutables durante la sesion.
- `empty`: marketplace sin resultados para verificar estados vacios.
- `error`: fallos controlados de consultas principales.
- `slow`: latencia alta para verificar skeletons.

## Rutas disponibles

- `/`, `/login`, `/register`
- `/dashboard`, `/profile`, `/activity`
- `/projects`, `/projects/new`, `/projects/[projectId]`, `/projects/[projectId]/applications`
- `/applications` para freelancer
- `/payments` para cliente
- `/admin/users` para administrador

## Arquitectura

- `src/features`: services, hooks, esquemas y componentes organizados por capacidad.
- `src/lib/api`: cliente Axios, endpoints, adapters y normalizacion `ApiError`.
- `src/lib/auth`: sesion mock, roles canonicos y permisos.
- `src/lib/query`: query keys y configuracion de cache/retry.
- `src/mocks`: handlers MSW y base de datos coherente que muta durante la sesion.
- `src/components`: sistema visual y shell responsive.

Los componentes consumen modelos frontend; los DTOs del backend se transforman exclusivamente en adapters. La sesion JWT mock es una herramienta de desarrollo, no una estrategia final de seguridad.

## Conectar el backend real

```env
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_BASE_URL=http://localhost:5021/api
```

Consulta [docs/backend-integration.md](docs/backend-integration.md) para las diferencias del backend que deben validarse antes de una integracion productiva.

## Verificacion

```bash
npm run lint
npx tsc --noEmit
npm run build
```
