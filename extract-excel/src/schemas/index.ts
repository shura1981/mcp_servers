import { z } from 'zod';

/**
 * Schema para la herramienta de extracción de Excel
 * Valida que se proporcione una ruta URI válida al archivo Excel
 */
export const ExtractExcelSchema = z.object({
  uri: z.string().describe('Ruta absoluta al archivo Excel (por ejemplo: /home/user/data.xlsx)'),
});

export type ExtractExcelInput = z.infer<typeof ExtractExcelSchema>;

/**
 * Schema para la herramienta de creación de Excel
 * Permite crear archivos Excel desde datos JSON con múltiples pestañas
 */
export const CreateExcelSchema = z.object({
  outputPath: z.string().describe('Ruta absoluta donde se guardará el archivo Excel'),
  data: z.union([
    z.array(z.record(z.unknown())).describe('Array de objetos para una sola pestaña'),
    z.record(z.array(z.record(z.unknown()))).describe('Objeto con múltiples pestañas, donde cada clave es el nombre de la pestaña')
  ]).describe('Datos en formato JSON para crear el archivo Excel'),
  sheetName: z.string().optional().describe('Nombre de la pestaña (solo si data es un array simple)'),
});

export type CreateExcelInput = z.infer<typeof CreateExcelSchema>;
