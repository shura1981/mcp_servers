import ExcelJS from 'exceljs';
import { ExcelRow, ExcelCreationResult } from '../types/index.js';

/**
 * Crea un archivo Excel desde datos JSON
 * @param data Datos para crear el Excel (puede ser un array simple o un objeto con múltiples pestañas)
 * @param filePath Ruta donde se guardará el archivo
 * @param defaultSheetName Nombre por defecto si se proporciona un array simple
 * @returns Resultado de la operación
 */
export async function createExcelFile(
  data: ExcelRow[] | Record<string, ExcelRow[]>,
  filePath: string,
  defaultSheetName: string = 'Sheet1'
): Promise<ExcelCreationResult> {
  try {
    const workbook = new ExcelJS.Workbook();
    let sheetsCreated = 0;

    // Si data es un array, crear una sola pestaña
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Los datos no pueden estar vacíos');
      }

      const worksheet = workbook.addWorksheet(defaultSheetName);
      
      // Extraer encabezados del primer objeto
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Agregar datos
      data.forEach((row) => {
        const values = headers.map((header) => row[header]);
        worksheet.addRow(values);
      });

      sheetsCreated = 1;
    } else {
      // Si data es un objeto, crear múltiples pestañas
      for (const [sheetName, sheetData] of Object.entries(data)) {
        if (!Array.isArray(sheetData) || sheetData.length === 0) {
          continue;
        }

        const worksheet = workbook.addWorksheet(sheetName);
        
        // Extraer encabezados del primer objeto
        const headers = Object.keys(sheetData[0]);
        worksheet.addRow(headers);

        // Agregar datos
        sheetData.forEach((row) => {
          const values = headers.map((header) => row[header]);
          worksheet.addRow(values);
        });

        sheetsCreated++;
      }
    }

    if (sheetsCreated === 0) {
      throw new Error('No se crearon pestañas. Verifica que los datos sean válidos.');
    }

    // Escribir el archivo
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      filePath,
      sheetsCreated,
      message: `Archivo Excel creado exitosamente con ${sheetsCreated} pestaña(s)`,
    };
  } catch (error) {
    throw new Error(`Error al crear el archivo Excel: ${(error as Error).message}`);
  }
}
