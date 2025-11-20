import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExtractExcelSchema } from '../schemas/index.js';
import { parseExcelFile } from '../utils/excelParser.js';
import { z } from 'zod';

/**
 * Registra la herramienta de extracción de Excel en el servidor MCP
 * Extrae información de un archivo Excel y la devuelve en formato JSON
 */
export function registerExtractExcelTool(server: McpServer): void {
  server.registerTool(
    'extract_excel',
    {
      description: 'Extrae información de un archivo Excel y devuelve los datos en formato JSON. Si el archivo tiene múltiples pestañas, cada una será representada como un objeto en un array.',
      inputSchema: z.object({
        uri: z.string().describe('Ruta absoluta al archivo Excel (por ejemplo: /home/user/data.xlsx)'),
      }),
    },
    async ({ uri }) => {
      try {
        // Extraer datos del Excel
        const result = await parseExcelFile(uri);

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
        throw new Error(`Error al extraer el archivo Excel: ${errorMessage}`);
      }
    }
  );
}
