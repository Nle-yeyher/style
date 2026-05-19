# Manual de Visualización y Ejecución del Proyecto

Este manual detalla los pasos necesarios para configurar, ejecutar y visualizar los resultados del proyecto iterativo, el cual ha sido recientemente refactorizado de Firebase a **MongoDB** utilizando **Next.js** (App Router) y Server Components.

## 1. Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado en tu entorno local:

- **Node.js** (v18 o superior recomendado)
- **Base de Datos MongoDB:**
  - Puede ser una instancia de [MongoDB local](https://www.mongodb.com/try/download/community) corriendo en tu máquina (recomendado usar [MongoDB Compass](https://www.mongodb.com/products/tools/compass) para visualizar los datos directamente).
  - O una base de datos en la nube usando [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## 2. Instalación de Dependencias

Abre tu terminal, asegúrate de estar situado en la raíz del proyecto (donde se encuentra el `package.json`) y ejecuta el siguiente comando para instalar todos los paquetes y módulos necesarios:

```bash
npm install
```

## 3. Configuración del Entorno (.env)

El proyecto requiere saber a dónde se va a conectar dentro del esquema de MongoDB.

1. Al estar trabajando localmente, abre (o mantén abierto) tu archivo `.env` en la raíz del proyecto.
2. Asegúrate de añadir o modificar la variable de entorno `MONGODB_URI`.

Si tienes MongoDB localmente (puerto estándar 27017):
```env
MONGODB_URI=mongodb://localhost:27017/stylesavvy
```

Si usas MongoDB Atlas, la cadena lucirá similar a esta:
```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.XXXXXX.mongodb.net/stylesavvy?retryWrites=true&w=majority
```

## 4. Ejecución del Servidor de Desarrollo

Una vez que tengas la base de datos encendida y la conexión configurada, puedes iniciar el entorno de Next.js. El comando está configurado para ejecutarse con _Turbopack_ en el puerto `9002`.

Ejecuta el siguiente comando:

```bash
npm run dev
```

Una vez que observes en la terminal el mensaje de que el servidor está listo, abre tu navegador web preferido para empezar la visualización.

## 5. Rutas de Visualización de Resultados

Para ver los resultados de la migración y la operativa del proyecto, navega a las siguientes URL alojadas de manera local:

### 🛍️ A. Catálogo Principal (Front-end)
👉 **Enlace:** [http://localhost:9002/](http://localhost:9002/)

- **¿Qué visualizarás?** La pantalla de destino. Aquí se cargarán dinámicamente los productos disponibles directamente desde MongoDB utilizando React Server Components.
- Si la base de datos está recién instanciada, esta vista puede estar vacía. Primero debes registrar datos desde el Panel de Administración.

### ⚙️ B. Panel de Control (Back-office / Admin)
👉 **Enlace:** [http://localhost:9002/admin](http://localhost:9002/admin)

- **¿Qué visualizarás?** La herramienta de gestión con acciones de Servidor (Server Actions) para testear y ejecutar el esquema (CRUD).
- **Acciones Disponibles en esta Interfaz:**
  - **Crear:** Agrega nuevos productos ingresando el nombre, precio y demás información. Al agregarlos, observa cómo se registran inmediatamente en la base de datos MongoDB.
  - **Consultar y Modificar:** Puedes leer un listado estructurado de los productos actuales y alterarlos en tiempo real.
  - **Eliminar:** Probar el retiro de datos.

### 🔎 C. Detalle de Producto Individual
👉 **Enlace:** `http://localhost:9002/products/el-id-del-producto`

- **¿Qué visualizarás?** La ficha en particular de un activo. Para encontrar una URL válida, puedes hacer clic dentro de uno de los productos de la página principal.

---

> [!TIP]
> **Consejo de Desarrollo Operativo:** 
> Ya que parte importante de este ciclo implica verificar que *la data se guarde correctamente*, el uso de una herramienta gráfica nativa, como **MongoDB Compass**, conectada paralelamente a la misma `MONGODB_URI`, te permitirá cruzar las revisiones (puedes ver si un producto creado desde `/admin` en Next.js se almacena bajo la colección de la Base de Datos al instante).
