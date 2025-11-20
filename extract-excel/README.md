# Extract Excel MCP Server

Servidor MCP (Model Context Protocol) stdio para extraer y crear archivos Excel usando TypeScript y ExcelJS.

## Características

✅ **Extracción de Excel**: Extrae datos de archivos Excel (.xlsx) y los convierte a formato JSON  
✅ **Múltiples pestañas**: Soporta archivos con múltiples pestañas, cada una representada como un objeto  
✅ **Creación de Excel**: Crea archivos Excel desde datos JSON  
✅ **Soporte multi-pestaña**: Permite crear archivos con una o múltiples pestañas  
✅ **Compatible con Node.js v23.3.0+**  
✅ **Protocolo MCP stdio**: Comunicación estándar mediante entrada/salida estándar  
✅ **TypeScript 5.x**: Código completamente tipado con ES2022  
✅ **Validación con Zod**: Validación robusta de entradas

## Requisitos

- Node.js >= 23.3.0
- npm o yarn

## Instalación

```bash
# Clonar el repositorio o navegar al directorio
cd extract-excel

# Instalar dependencias
npm install

# Compilar el proyecto
npm run build
```

## Uso

### 1. Ejecutar directamente

```bash
npm start
```

### 2. Usar con MCP Inspector (Desarrollo)

```bash
npm run inspector
```

### 3. Configurar en un cliente MCP

Agregar al archivo de configuración del cliente MCP:

```json
{
  "mcpServers": {
    "extract-excel": {
      "command": "node",
      "args": ["/ruta/absoluta/extract-excel/dist/index.js"]
    }
  }
}
```

## Herramientas Disponibles

### 1. `extract_excel`

Extrae información de un archivo Excel y devuelve los datos en formato JSON.

**Parámetros:**
- `uri` (string, requerido): Ruta absoluta al archivo Excel

**Ejemplo de entrada:**
```json
{
  "uri": "/home/user/documents/data.xlsx"
}
```

**Ejemplo de salida:**
```json
{
  "sheets": [
    {
      "name": "Sheet1",
      "data": [
        {
          "Name": "John Doe",
          "Age": 30,
          "Email": "john@example.com"
        },
        {
          "Name": "Jane Smith",
          "Age": 25,
          "Email": "jane@example.com"
        }
      ]
    },
    {
      "name": "Sheet2",
      "data": [
        {
          "Product": "Laptop",
          "Price": 999.99,
          "Stock": 50
        }
      ]
    }
  ],
  "totalSheets": 2
}
```

### 2. `create_excel`

Crea un archivo Excel desde datos JSON.

**Parámetros:**
- `outputPath` (string, requerido): Ruta absoluta donde se guardará el archivo
- `data` (array u object, requerido): Datos en formato JSON
  - **Array de objetos**: Crea una sola pestaña
  - **Objeto con claves**: Cada clave es el nombre de una pestaña
- `sheetName` (string, opcional): Nombre de la pestaña si `data` es un array (por defecto: "Sheet1")

**Ejemplo 1: Una sola pestaña**
```json
{
  "outputPath": "/home/user/output.xlsx",
  "data": [
    {"Name": "Alice", "Age": 28},
    {"Name": "Bob", "Age": 32}
  ],
  "sheetName": "Employees"
}
```

**Ejemplo 2: Múltiples pestañas**
```json
{
  "outputPath": "/home/user/report.xlsx",
  "data": {
    "Sales": [
      {"Month": "January", "Revenue": 50000},
      {"Month": "February", "Revenue": 60000}
    ],
    "Expenses": [
      {"Category": "Rent", "Amount": 2000},
      {"Category": "Utilities", "Amount": 500}
    ]
  }
}
```

**Ejemplo de salida:**
```json
{
  "success": true,
  "filePath": "/home/user/output.xlsx",
  "sheetsCreated": 2,
  "message": "Archivo Excel creado exitosamente con 2 pestaña(s)"
}
```

## Estructura del Proyecto

```
extract-excel/
├── src/
│   ├── index.ts              # Punto de entrada del servidor
│   ├── server.ts             # Configuración del servidor MCP
│   ├── tools/                # Herramientas MCP
│   │   ├── extractExcel.ts   # Herramienta de extracción
│   │   ├── createExcel.ts    # Herramienta de creación
│   │   └── index.ts          # Exportaciones
│   ├── schemas/              # Schemas de validación Zod
│   │   └── index.ts
│   ├── types/                # Tipos TypeScript
│   │   └── index.ts
│   └── utils/                # Utilidades
│       ├── excelParser.ts    # Parser de Excel
│       └── excelWriter.ts    # Escritor de Excel
├── dist/                     # Código compilado
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts Disponibles

- `npm run build` - Compila el proyecto TypeScript
- `npm start` - Ejecuta el servidor compilado
- `npm run dev` - Compila y ejecuta en un solo paso
- `npm run watch` - Compila en modo observación
- `npm run inspector` - Ejecuta con MCP Inspector para debugging

## Ejemplos de Uso

### Extracción de Excel

```bash
# Usando MCP Inspector
# Llamar a la herramienta extract_excel con:
{
  "uri": "/home/user/data.xlsx"
}
```

### Creación de Excel Simple

```bash
# Llamar a la herramienta create_excel con:
{
  "outputPath": "/home/user/new_file.xlsx",
  "data": [
    {"ID": 1, "Name": "Product A", "Price": 100},
    {"ID": 2, "Name": "Product B", "Price": 200}
  ]
}
```

### Creación de Excel con Múltiples Pestañas

```bash
# Llamar a la herramienta create_excel con:
{
  "outputPath": "/home/user/multi_sheet.xlsx",
  "data": {
    "Q1": [
      {"Month": "Jan", "Sales": 1000},
      {"Month": "Feb", "Sales": 1200}
    ],
    "Q2": [
      {"Month": "Apr", "Sales": 1500},
      {"Month": "May", "Sales": 1800}
    ]
  }
}
```

## Tecnologías Utilizadas

- **Node.js v23.3.0+**: Runtime de JavaScript
- **TypeScript 5.7**: Lenguaje con tipado estático
- **@modelcontextprotocol/sdk**: SDK oficial de MCP
- **ExcelJS 4.4**: Librería para manipular archivos Excel
- **Zod 3.23**: Validación de schemas

## Troubleshooting

### Error: "No se encuentra el módulo @modelcontextprotocol/sdk"

Asegúrate de haber instalado las dependencias:
```bash
npm install
```

### Error al leer/escribir archivos Excel

Verifica que:
1. La ruta del archivo sea absoluta
2. Tengas permisos de lectura/escritura
3. El archivo Excel no esté abierto en otra aplicación

### El servidor no responde

1. Verifica que el proyecto esté compilado: `npm run build`
2. Revisa los logs en stderr
3. Usa MCP Inspector para debugging: `npm run inspector`

## Licencia

MIT

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, por favor abre un issue en el repositorio.
