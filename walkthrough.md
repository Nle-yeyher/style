# Migración de Firebase a MongoDB

¡El proyecto ha sido completamente refactorizado para usar MongoDB como base de datos principal y se han eliminado todas las referencias a Firebase!

## Cambios Realizados

- **Dependencias Actualizadas:** Se desinstalaron `firebase`, `@firebase/app`, `@firebase/firestore` y `@firebase/auth`. Se instalaron `mongoose` y `mongodb`.
- **Eliminación de Configuración de Firebase:** Se eliminó la carpeta `src/firebase/`, así como [studio.json](file:///c:/Users/USUARIO/Downloads/project%20%282%29/studio.json) y [apphosting.yaml](file:///c:/Users/USUARIO/Downloads/project%20%282%29/apphosting.yaml).
- **Nuevo Proveedor de Datos:** Se implementó [src/lib/mongodb.ts](file:///c:/Users/USUARIO/Downloads/project%20%282%29/src/lib/mongodb.ts) para gestionar la conexión global de Mongoose hacia MongoDB.
- **Modelo de Productos:** Se creó [src/lib/models/Product.ts](file:///c:/Users/USUARIO/Downloads/project%20%282%29/src/lib/models/Product.ts) para instanciar el schema y tipado de MongoDB.
- **Server Components:**
  - [src/app/page.tsx](file:///c:/Users/USUARIO/Downloads/project%20%282%29/src/app/page.tsx) y [src/app/products/[id]/page.tsx](file:///c:/Users/USUARIO/Downloads/project%20%282%29/src/app/products/%5Bid%5D/page.tsx) fueron reescritos para usar Next.js Server Components, leyendo datos de la base de datos de manera asíncrona sin necesidad de estado o carga de lado del cliente (`loading`).
- **Server Actions para el Panel de Control:**
  - Se creó [src/app/admin/actions.ts](file:///c:/Users/USUARIO/Downloads/project%20%282%29/src/app/admin/actions.ts) para proveer las acciones de CRUD (Create, Read, Update, Delete) de productos desde el servidor hacia el cliente.
  - El archivo [src/app/admin/page.tsx](file:///c:/Users/USUARIO/Downloads/project%20%282%29/src/app/admin/page.tsx) fue actualizado para invocar estas Server Actions en lugar de modificar Firestore directamente.
- **Sin Autenticación Obligatoria:** Se ha retirado el paso de Login de Firebase, así que el admin dashboard (`/admin`) está simplificado para propósitos experimentales.

## Siguientes Pasos

> [!IMPORTANT]
> **Base de datos local:** 
> El proyecto asume por defecto que tienes MongoDB ejecutándose localmente (`mongodb://localhost:27017/stylesavvy`). 
> Si deseas usar Mongo Atlas, o tienes otra URL, por favor agrégala a tu archivo [.env](file:///c:/Users/USUARIO/Downloads/project%20%282%29/.env):
> ```
> MONGODB_URI=mongodb+srv://tu-usuario:tu-password@tu-cluster.mongodb.net/stylesavvy
> ```

### Cómo ejecutar

Prueba tus cambios iniciando el servidor de Next.js:
```bash
npm run dev
```
