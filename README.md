# MCP Servers Collection

Colección de servidores del Protocolo de Contexto de Modelo (MCP) desarrollados en TypeScript, diseñados para proporcionar capacidades extendidas de interacción con sistemas de archivos, bases de datos y procesamiento de documentos.

## 🎯 Descripción del Proyecto

Este repositorio contiene una colección de servidores MCP que implementan diversas funcionalidades para integración con agentes de IA y aplicaciones que utilizan el Model Context Protocol. Cada servidor está diseñado como un módulo independiente que puede ser ejecutado mediante stdio transport o HTTP, proporcionando herramientas específicas para diferentes casos de uso.

## 🚀 Tecnologías Principales

- **TypeScript 5.x** - Lenguaje principal de desarrollo con tipado estático
- **Node.js** - Runtime de ejecución (v14 o superior)
- **Model Context Protocol SDK** (@modelcontextprotocol/sdk v0.5.0 - v0.6.1)
- **ES2022** - Target de compilación JavaScript moderno
- **Zod** - Validación de esquemas y tipos en runtime
- **Express.js** - Framework HTTP para servidores con transporte HTTP
- **mysql2** - Cliente MySQL/MariaDB con soporte de promesas
- **pdf-parse** - Extracción de contenido de archivos PDF

## 📁 Estructura del Proyecto

```
mcp_servers/
├── .github/
│   ├── instructions/          # Guías de desarrollo y estándares
│   │   ├── typescript-5-es2022.instructions.md
│   │   └── typescript-mcp-server-generator.prompt.md
│   └── prompts/              # Plantillas de generación de código
│       ├── readme-blueprint-generator.prompt.md
│       ├── typescript-mcp-server-generator.prompt.md
│       └── mcp-copilot-studio-server-generator.prompt.md
├── extract-excel/            # Servidor de extracción de Excel (en desarrollo)
├── extract-pdf/              # Servidor de extracción de PDF
│   ├── src/
│   │   ├── controllers/      # Controladores de API
│   │   ├── middlewares/      # Middleware de Express
│   │   ├── routes/           # Definiciones de rutas
│   │   ├── services/         # Lógica de negocio
│   │   ├── types/            # Definiciones de tipos TypeScript
│   │   └── utils/            # Utilidades (logger, etc.)
│   ├── test/                 # Archivos de prueba
│   ├── uploads/              # Directorio de carga temporal
│   └── index.ts              # Punto de entrada MCP
├── filesystem/               # Servidor de acceso al sistema de archivos
│   └── index.ts              # Servidor MCP con operaciones CRUD de archivos
├── mysql-server/             # Servidor de interacción con MySQL/MariaDB
│   ├── src/
│   │   └── index.ts          # Servidor MCP para consultas SQL
│   └── build/                # Archivos compilados
└── tsconfig.json             # Configuración TypeScript compartida
```

## 🔧 Servidores Disponibles

### 1. PDF Extractor Server

**Descripción**: Microservicio MCP para extraer contenido textual de archivos PDF.

**Características**:
- Extracción de texto completo de archivos PDF
- Extracción de páginas específicas
- API REST con Express.js
- Soporte MCP mediante stdio transport
- Sistema de logging con Winston

**Herramientas MCP**:
- `extract_text` - Extrae todo el texto de un archivo PDF
- `health_check` - Verifica el estado del servicio

**Instalación y Uso**:
```bash
cd extract-pdf
npm install
npm run build

# Modo producción
npm start

# Modo desarrollo
npm run dev

# Modo MCP (stdio)
npm run mcp
```

**API REST**:
```bash
# Extraer texto completo
curl -X POST http://localhost:3000/api/pdf/extract \
  -F "pdf=@ruta/al/archivo.pdf"

# Extraer página específica
curl -X POST "http://localhost:3000/api/pdf/extract/page?page=2" \
  -F "pdf=@ruta/al/archivo.pdf"
```

**Variables de Entorno**:
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### 2. Filesystem Server

**Descripción**: Servidor MCP que proporciona acceso seguro y controlado al sistema de archivos.

**Características**:
- Operaciones CRUD completas en archivos y directorios
- Sistema de seguridad basado en directorios permitidos
- Soporte de búsqueda con patrones glob
- Edición de archivos con generación de diffs
- Gestión de symlinks y validación de rutas
- Operaciones de lectura/escritura múltiples

**Herramientas MCP**:
- `read_file` - Leer contenido de archivos
- `read_multiple_files` - Leer múltiples archivos simultáneamente
- `write_file` - Crear o sobrescribir archivos
- `edit_file` - Editar archivos con reemplazo de líneas
- `create_directory` - Crear directorios
- `list_directory` - Listar contenido de directorios
- `directory_tree` - Obtener árbol recursivo de directorios
- `move_file` - Mover o renombrar archivos
- `search_files` - Buscar archivos con patrones
- `get_file_info` - Obtener metadatos de archivos
- `list_allowed_directories` - Listar directorios con permisos

**Instalación y Uso**:
```bash
cd filesystem
npm install
npm run build

# Ejecutar con directorios permitidos
node dist/index.js /ruta/permitida1 /ruta/permitida2
```

**Seguridad**:
- Todas las operaciones están restringidas a directorios explícitamente permitidos
- Validación de rutas reales (symlinks)
- Protección contra path traversal

### 3. MySQL Server

**Descripción**: Servidor MCP para interacción directa con bases de datos MySQL/MariaDB.

**Características**:
- Ejecución de consultas SQL arbitrarias
- Soporte para procedimientos almacenados
- Pool de conexiones para mejor rendimiento
- Manejo robusto de errores
- Soporte para múltiples declaraciones

**Herramientas MCP**:
- `execute_query` - Ejecuta cualquier consulta SQL
- `test_connection` - Verifica la conexión con la base de datos

**Instalación y Uso**:
```bash
cd mysql-server
npm install
npm run build
npm start
```

**Variables de Entorno**:
```env
MYSQL_HOST=localhost
MYSQL_USER=usuario
MYSQL_PASSWORD=contraseña
MYSQL_DATABASE=nombre_bd
MYSQL_PORT=3306
DEBUG_MYSQL=false
```

**Ejemplo de Uso**:
```json
{
  "query": "SELECT * FROM usuarios WHERE activo = 1"
}
```

## 🏗️ Arquitectura

### Principios de Diseño

- **Modularidad**: Cada servidor es independiente y autónomo
- **Seguridad**: Validación estricta de entradas y control de acceso
- **Tipo-seguro**: Uso extensivo de TypeScript y Zod para validación
- **Asincronía**: Operaciones async/await consistentes
- **Manejo de Errores**: Captura y logging completo de errores
- **Transportes Múltiples**: Soporte stdio y HTTP según necesidades

### Patrón de Implementación

Todos los servidores siguen un patrón consistente:

1. **Inicialización**: Configuración del servidor MCP con capabilities
2. **Registro de Herramientas**: Definición de tools con esquemas Zod
3. **Handlers**: Implementación de `ListToolsRequest` y `CallToolRequest`
4. **Validación**: Uso de Zod para validar inputs
5. **Ejecución**: Lógica de negocio en servicios dedicados
6. **Respuesta**: Formato estructurado con `content` y `structuredContent`
7. **Cleanup**: Cierre controlado con handlers SIGINT/SIGTERM

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js v14 o superior
- npm o yarn
- TypeScript 5.x (incluido como devDependency)

### Instalación Global

```bash
# Clonar el repositorio
git clone https://github.com/shura1981/mcp_servers.git
cd mcp_servers

# Instalar dependencias en cada servidor
for dir in extract-pdf filesystem mysql-server; do
  cd $dir
  npm install
  npm run build
  cd ..
done
```

### Configuración

1. **PDF Extractor**: Crear archivo `.env` en `extract-pdf/`
2. **MySQL Server**: Configurar variables de entorno con credenciales
3. **Filesystem**: Especificar directorios permitidos al ejecutar

### Ejecución

Cada servidor puede ejecutarse de forma independiente:

```bash
# PDF Extractor (modo MCP)
cd extract-pdf && npm run mcp

# Filesystem (stdio)
cd filesystem && node dist/index.js ~/documentos ~/proyectos

# MySQL Server
cd mysql-server && npm start
```

### Pruebas con MCP Inspector

```bash
# Instalar MCP Inspector
npx @modelcontextprotocol/inspector

# Conectar a un servidor
# Para stdio servers, ejecutar directamente
# Para HTTP servers, usar: http://localhost:PORT/mcp
```

## 💻 Flujo de Desarrollo

### Estándares de Código

- **Target**: TypeScript 5.x → ES2022
- **Módulos**: ES Modules puros (no CommonJS)
- **Estilo**: PascalCase para clases/tipos, camelCase para funciones/variables
- **Archivos**: kebab-case (ej: `user-service.ts`)
- **Linting**: Ejecutar `npm run lint` antes de commits
- **Formato**: Mantener consistencia con prettier/eslint del proyecto

### Principios de Codificación

1. **Claridad sobre Brevedad**: Código explícito y legible
2. **Tipos Estrictos**: Evitar `any`, preferir `unknown` con narrowing
3. **Funciones Puras**: Favorecer inmutabilidad cuando sea práctico
4. **Manejo de Errores**: Try/catch con logging estructurado
5. **Async/Await**: Patrón consistente para operaciones asíncronas
6. **Validación de Entrada**: Zod schemas para toda entrada externa
7. **Documentación Inline**: Comentarios para lógica compleja

### Workflow de Git

```bash
# Rama actual de desarrollo
git checkout dev

# Crear feature branch
git checkout -b feature/nombre-caracteristica

# Commits descriptivos
git commit -m "feat: agregar herramienta de búsqueda en PDF"

# Push y pull request a dev
git push origin feature/nombre-caracteristica
```

**Ramas**:
- `main` - Rama principal estable
- `dev` - Rama de desarrollo activo

## 🧪 Testing

### Enfoque de Pruebas

- **Unit Tests**: Para servicios y utilidades
- **Integration Tests**: Para flujos completos de herramientas MCP
- **Validación de Schemas**: Tests de esquemas Zod

### Ejecutar Tests

```bash
# En cada servidor con tests configurados
npm test

# PDF Extractor
cd extract-pdf && npm test
```

## 📚 Documentación Adicional

### Recursos del Proyecto

- [TypeScript Guidelines](.github/instructions/typescript-5-es2022.instructions.md)
- [MCP Server Generator Prompt](.github/instructions/typescript-mcp-server-generator.prompt.md)
- [Model Context Protocol Docs](https://modelcontextprotocol.io)

### Guías de Herramientas

- **PDF Extractor**: Ver [extract-pdf/README.md](extract-pdf/README.md)
- **Filesystem**: Documentación en código
- **MySQL Server**: Comentarios inline en código fuente

## 🤝 Contribuir

### Cómo Contribuir

1. Fork del repositorio
2. Crear feature branch desde `dev`
3. Implementar cambios siguiendo estándares de código
4. Agregar/actualizar tests según corresponda
5. Actualizar documentación relevante
6. Submit pull request a rama `dev`

### Agregar Nuevo Servidor MCP

1. Crear directorio para el nuevo servidor
2. Seguir estructura estándar (src/, test/, index.ts)
3. Implementar usando plantilla de [typescript-mcp-server-generator.prompt.md](.github/prompts/typescript-mcp-server-generator.prompt.md)
4. Agregar README.md específico
5. Actualizar este README con nueva sección

### Code Review

- Validar adherencia a TypeScript guidelines
- Verificar seguridad y validación de inputs
- Confirmar manejo apropiado de errores
- Revisar tests y cobertura
- Comprobar documentación actualizada

## 📝 Licencia

- **PDF Extractor**: ISC License
- **Filesystem Server**: MIT License
- **MySQL Server**: ISC License

## 👥 Autores

- **Repositorio**: [shura1981](https://github.com/shura1981)
- **Filesystem Server**: Basado en [Anthropic MCP Servers](https://github.com/modelcontextprotocol/servers)

## 🔗 Enlaces Útiles

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

## 📊 Estado del Proyecto

| Servidor | Estado | Versión | Transporte |
|----------|--------|---------|------------|
| PDF Extractor | ✅ Producción | 1.0.0 | stdio + HTTP |
| Filesystem | ✅ Producción | 0.6.2 | stdio |
| MySQL Server | ✅ Producción | 0.1.0 | stdio |
| Excel Extractor | 🚧 En desarrollo | - | - |

## 🐛 Troubleshooting

### Problemas Comunes

**Error de conexión MySQL**:
```bash
# Verificar variables de entorno
echo $MYSQL_HOST $MYSQL_USER

# Test de conexión
cd mysql-server && npm run build && npm start
```

**PDF Extractor no inicia**:
```bash
# Verificar directorios
ls -la extract-pdf/uploads extract-pdf/logs

# Recrear con permisos
mkdir -p extract-pdf/{uploads,logs} && chmod 755 extract-pdf/{uploads,logs}
```

**Filesystem acceso denegado**:
```bash
# Verificar rutas permitidas al ejecutar
node dist/index.js $(pwd)/directorio-permitido
```

### Logs y Debugging

- **PDF Extractor**: Logs en `extract-pdf/logs/`
- **MySQL Server**: Activar con `DEBUG_MYSQL=true`
- **Filesystem**: Errores en stderr
- **MCP Inspector**: Usar para debugging interactivo

## 🔄 Actualizaciones Futuras

- [ ] Servidor de extracción de Excel
- [ ] Tests automatizados completos
- [ ] Documentación de API con Swagger/OpenAPI
- [ ] Docker containers para cada servidor
- [ ] CI/CD pipeline con GitHub Actions
- [ ] Métricas y monitoreo
- [ ] Servidor de embeddings y búsqueda semántica
- [ ] Integración con más bases de datos (PostgreSQL, MongoDB)

---

**Última actualización**: Noviembre 2025  
**Rama de desarrollo**: `dev`  
**Rama estable**: `main`
