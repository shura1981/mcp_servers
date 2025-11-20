# PDF Extractor

Un microservicio para extraer contenido de archivos PDF.

## Descripción

Este microservicio proporciona una API REST para extraer texto de archivos PDF. Permite cargar un archivo PDF y obtener su contenido textual completo, o extraer texto de una página específica.

## Requisitos

- Node.js (v14 o superior)
- npm o yarn

## Instalación

1. Clona este repositorio o descarga los archivos fuente.

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto (ya debe existir con la siguiente configuración):

```
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Compilación

Para compilar el código TypeScript a JavaScript:

```bash
npm run build
```

## Ejecución

### Modo Producción

Para ejecutar la aplicación en modo producción:

```bash
npm start
```

### Modo Desarrollo

Para ejecutar la aplicación en modo desarrollo con recarga automática:

```bash
npm run dev
```

## Uso de la API

### Extraer Texto Completo de un PDF

**Endpoint:** `POST /api/pdf/extract`

**Content-Type:** `multipart/form-data`

**Parámetros:**
- `pdf` (archivo): El archivo PDF del que se extraerá el texto.

**Ejemplo (usando curl):**
```bash
curl -X POST http://localhost:3000/api/pdf/extract \
  -F "pdf=@ruta/al/archivo.pdf"
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "text": "Contenido extraído del PDF...",
    "info": { /* Información adicional del PDF */ },
    "pages": 5
  }
}
```

### Extraer Texto de una Página Específica

**Endpoint:** `POST /api/pdf/extract/page?page=1`

**Content-Type:** `multipart/form-data`

**Parámetros:**
- `pdf` (archivo): El archivo PDF del que se extraerá el texto.
- `page` (query): Número de página a extraer (comenzando desde 1).

**Ejemplo (usando curl):**
```bash
curl -X POST "http://localhost:3000/api/pdf/extract/page?page=2" \
  -F "pdf=@ruta/al/archivo.pdf"
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "text": "Texto de la página específica...",
    "info": { /* Información adicional del PDF */ },
    "page": 2
  }
}
```

### Verificar Estado del Servicio

**Endpoint:** `GET /api/pdf/health`

**Ejemplo:**
```bash
curl http://localhost:3000/api/pdf/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "message": "Servicio funcionando correctamente"
}
```

## Estructura del Proyecto

```
pdf-extractor/
│
├── src/
│   ├── controllers/      # Controladores para manejar las solicitudes HTTP
│   │   └── pdfController.ts
│   ├── services/         # Servicios para la lógica de negocio
│   │   └── pdfService.ts
│   ├── routes/           # Definiciones de rutas de la API
│   │   └── pdfRoutes.ts
│   ├── middlewares/      # Middlewares personalizados
│   │   └── upload.ts     # Configuración de carga de archivos
│   ├── utils/            # Utilidades y helpers
│   │   └── logger.ts     # Configuración del sistema de logging
│   └── app.ts            # Punto de entrada de la aplicación
│
├── uploads/              # Directorio temporal para archivos subidos
├── logs/                 # Registros de la aplicación
├── dist/                 # Código compilado (generado)
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración de TypeScript
```

## Características

- Extracción de texto completo de archivos PDF
- Extracción de texto de páginas específicas
- Validación de tipos de archivos (sólo PDF)
- Límite de tamaño de archivo configurable (actualmente 10MB)
- Logging detallado usando Winston
- Manejo de errores centralizado
- Gestión automática de archivos temporales

## Dependencias Principales

- express: Framework web para Node.js
- multer: Middleware para manejo de carga de archivos
- pdf-parse: Biblioteca para analizar y extraer texto de PDFs
- winston: Sistema de logging
- cors: Soporte para CORS
- dotenv: Manejo de variables de entorno

## Licencia

Este proyecto es software libre.