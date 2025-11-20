import ExcelJS from 'exceljs';
import { ExcelSheet, ExcelRow, ExcelExtractionResult } from '../types/index.js';

/**
 * Parsea un archivo Excel y extrae todos sus datos en formato JSON
 * @param filePath Ruta absoluta al archivo Excel
 * @returns Objeto con todas las pestañas y sus datos
 */
export async function parseExcelFile(filePath: string): Promise<ExcelExtractionResult> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheets: ExcelSheet[] = [];

    workbook.eachSheet((worksheet, sheetId) => {
      const sheetData: ExcelRow[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Primera fila como encabezados
          row.eachCell((cell, colNumber) => {
            const headerValue = cell.value?.toString() || `Column${colNumber}`;
            headers.push(headerValue);
          });
        } else {
          // Datos de las filas
          const rowData: ExcelRow = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1] || `Column${colNumber}`;
            let cellValue: string | number | boolean | Date | null = null;

            if (cell.value !== null && cell.value !== undefined) {
              if (cell.value instanceof Date) {
                cellValue = cell.value;
              } else if (typeof cell.value === 'object' && 'result' in cell.value) {
                // Fórmulas: extraer el resultado
                cellValue = (cell.value as any).result;
              } else if (typeof cell.value === 'object' && 'text' in cell.value) {
                // Rich text
                cellValue = (cell.value as any).text;
              } else {
                cellValue = cell.value as string | number | boolean;
              }
            }

            rowData[header] = cellValue;
          });

          sheetData.push(rowData);
        }
      });

      sheets.push({
        name: worksheet.name,
        data: sheetData,
      });
    });

    return {
      sheets,
      totalSheets: sheets.length,
    };
  } catch (error) {
    throw new Error(`Error al parsear el archivo Excel: ${(error as Error).message}`);
  }
}
