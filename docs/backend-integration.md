# Integracion futura con FreeLink API

El frontend usa modelos de dominio limpios y consume el API solo mediante services y adapters. Para cambiar MSW por ASP.NET Core:

```env
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_BASE_URL=http://localhost:5021/api
```

No deben cambiarse paginas ni componentes al realizar la integracion. Cualquier variacion del contrato debe aislarse en `src/lib/api/adapters.ts` o en el service de la feature correspondiente.

## Dependencias pendientes del backend

- Verificar registro efectivo de MediatR y AutoMapper antes de usar auth, usuarios y freelancers reales.
- Proteger proyectos y postulaciones en API; el mock ya exige autenticacion, rol y pertenencia.
- Unificar `Admin` con el rol canonico `Administrador`; `normalizeUserRole` absorbe temporalmente ambas variantes.
- Mantener propuestas fuera del flujo principal hasta resolver almacenamiento in-memory y la incompatibilidad `Guid` frente a `int` de proyectos.
- Mover secretos JWT y conexion a base de datos fuera del codigo/configuracion versionada.
- Confirmar formato comun de errores; el frontend normaliza respuestas actuales a `ApiError`.
- Configurar CORS y base URLs por ambiente.
- Confirmar persistencia y retorno de `requiredSkills`, que el mock conserva mientras el contrato actual no lo garantiza completamente.

## Decision de seguridad

MSW simula una API corregida: creacion/edicion de proyectos se restringe al cliente propietario; postularse requiere freelancer; aceptar postulaciones y revisar entregables requiere cliente propietario; enviar entregables requiere freelancer asignado. Estas comprobaciones mejoran la demo, pero no sustituyen controles reales del servidor.
