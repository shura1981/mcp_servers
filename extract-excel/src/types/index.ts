/**
 * Representa una celda de Excel con su valor
 */
export interface ExcelCell {
  value: string | number | boolean | Date | null;
}

/**
 * Representa una fila de Excel como un objeto con valores indexados
 */
export type ExcelRow = Record<string, string | number | boolean | Date | null>;

/**
 * Representa una pestaña completa de un archivo Excel
 */
export interface ExcelSheet {
  name: string;
  data: ExcelRow[];
}

/**
 * Resultado de extracción de Excel con múltiples pestañas
 */
export interface ExcelExtractionResult {
  sheets: ExcelSheet[];
  totalSheets: number;
}

/**
 * Datos para crear un archivo Excel
 */
export interface ExcelCreationData {
  [sheetName: string]: ExcelRow[];
}

/**
 * Resultado de creación de archivo Excel
 */
export interface ExcelCreationResult {
  success: boolean;
  filePath: string;
  sheetsCreated: number;
  message: string;
}
