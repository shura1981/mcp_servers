# Ejemplos de Uso del Extract Excel MCP Server

## Prueba con MCP Inspector

Para probar el servidor con MCP Inspector:

```bash
npm run inspector
```

## Ejemplo 1: Extraer datos de un archivo Excel

### Entrada para la herramienta `extract_excel`:
```json
{
  "uri": "/ruta/absoluta/a/tu/archivo.xlsx"
}
```

### Salida esperada:
```json
{
  "sheets": [
    {
      "name": "Sheet1",
      "data": [
        {
          "Columna1": "valor1",
          "Columna2": "valor2"
        }
      ]
    }
  ],
  "totalSheets": 1
}
```

## Ejemplo 2: Crear un Excel simple (una sola pestaña)

### Entrada para la herramienta `create_excel`:
```json
{
  "outputPath": "/tmp/test_output.xlsx",
  "data": [
    {
      "ID": 1,
      "Nombre": "Juan",
      "Edad": 30
    },
    {
      "ID": 2,
      "Nombre": "María",
      "Edad": 25
    }
  ],
  "sheetName": "Empleados"
}
```

### Salida esperada:
```json
{
  "success": true,
  "filePath": "/tmp/test_output.xlsx",
  "sheetsCreated": 1,
  "message": "Archivo Excel creado exitosamente con 1 pestaña(s)"
}
```

## Ejemplo 3: Crear un Excel con múltiples pestañas

### Entrada para la herramienta `create_excel`:
```json
{
  "outputPath": "/tmp/reporte_trimestral.xlsx",
  "data": {
    "Q1_Ventas": [
      {
        "Mes": "Enero",
        "Ventas": 50000,
        "Gastos": 30000
      },
      {
        "Mes": "Febrero",
        "Ventas": 55000,
        "Gastos": 32000
      }
    ],
    "Q2_Ventas": [
      {
        "Mes": "Abril",
        "Ventas": 60000,
        "Gastos": 35000
      },
      {
        "Mes": "Mayo",
        "Ventas": 65000,
        "Gastos": 38000
      }
    ],
    "Resumen": [
      {
        "Trimestre": "Q1",
        "Total": 105000
      },
      {
        "Trimestre": "Q2",
        "Total": 125000
      }
    ]
  }
}
```

### Salida esperada:
```json
{
  "success": true,
  "filePath": "/tmp/reporte_trimestral.xlsx",
  "sheetsCreated": 3,
  "message": "Archivo Excel creado exitosamente con 3 pestaña(s)"
}
```

## Uso Programático (en un cliente MCP)

### Configuración en Claude Desktop (ejemplo):

Editar `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "extract-excel": {
      "command": "node",
      "args": [
        "/ruta/absoluta/a/extract-excel/dist/index.js"
      ]
    }
  }
}
```

### Luego en Claude:

**Usuario:** "Por favor extrae los datos del archivo /home/user/ventas.xlsx"

**Claude usará:** `extract_excel` con `uri: /home/user/ventas.xlsx`

**Usuario:** "Crea un Excel con estos datos: [datos en formato JSON]"

**Claude usará:** `create_excel` con los datos y ruta especificados
