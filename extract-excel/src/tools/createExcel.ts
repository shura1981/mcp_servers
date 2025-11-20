import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CreateExcelSchema } from '../schemas/index.js';
import { createExcelFile } from '../utils/excelWriter.js';
import { z } from 'zod';

/**
 * Registra la herramienta de creación de Excel en el servidor MCP
 * Crea un archivo Excel desde datos JSON con soporte para múltiples pestañas
 */
export function registerCreateExcelTool(server: McpServer): void {
  server.registerTool(
    'create_excel',
    {
      description: 'Crea un archivo Excel desde datos JSON. Soporta crear archivos con múltiples pestañas. Los datos pueden ser un array de objetos (una sola pestaña) o un objeto donde cada clave es el nombre de una pestaña y el valor es un array de objetos.',
      inputSchema: z.object({
        outputPath: z.string().describe('Ruta absoluta donde se guardará el archivo Excel (por ejemplo: /home/user/output.xlsx)'),
        data: z.union([
          z.array(z.record(z.unknown())),
          z.record(z.array(z.record(z.unknown()))),
        ]).describe('Datos en formato JSON. Puede ser un array de objetos para una sola pestaña, o un objeto con múltiples pestañas donde cada clave es el nombre de la pestaña.'),
        sheetName: z.string().optional().describe('Nombre de la pestaña (solo se usa si data es un array simple). Por defecto: "Sheet1"'),
      }),
    },
    async ({ outputPath, data, sheetName }) => {
      try {
        const effectiveSheetName = sheetName || 'Sheet1';

        // Crear el archivo Excel
        const result = await createExcelFile(
          data as any,
          outputPath,
          effectiveSheetName
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        throw new Error(`Error al crear el archivo Excel: ${errorMessage}`);
      }
    }
  );
}
