import fs from 'fs';
import pdf from 'pdf-parse';
import { logger } from '../utils/logger.js';

// Ya no se necesita PdfExtractResult, los métodos devolverán string o lanzarán error.

export class PdfService {
  /**
   * Extrae el contenido de un archivo PDF.
   * Devuelve el texto extraído o lanza un error si falla.
   * @param filePath Ruta al archivo PDF
   */
  async extractText(filePath: string): Promise<string> {
    logger.debug(`Intentando extraer texto de: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      logger.error(`El archivo no existe: ${filePath}`);
      throw new Error(`El archivo no existe: ${filePath}`);
    }

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer); // Usar opciones por defecto si no hay específicas
      
      logger.info(`PDF procesado correctamente: ${filePath}`);
      if (typeof data.text !== 'string') {
        logger.warn(`No se extrajo texto del PDF o el formato no es string: ${filePath}`);
        throw new Error('No se pudo extraer contenido textual del PDF.');
      }
      return data.text;
    } catch (error: any) {
      logger.error(`Error al procesar el PDF [${filePath}]: ${error.message}`);
      // Re-lanzar el error para que sea manejado por el llamador
      throw new Error(`Error al procesar el PDF: ${error.message}`);
    }
    // El 'finally' para eliminar archivos se manejaría mejor en el llamador (index.ts)
    // si es que los archivos son temporales y creados por el servidor MCP.
  }

  /**
   * Extrae el contenido de una página específica de un PDF.
   * Devuelve el texto extraído o lanza un error si falla.
   * @param filePath Ruta al archivo PDF
   * @param options Opciones adicionales (página específica, etc.)
   */
  async extractWithOptions(filePath: string, options: { pageNum: number }): Promise<string> {
    logger.debug(`Intentando extraer texto de la página ${options.pageNum} de: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      logger.error(`El archivo no existe: ${filePath}`);
      throw new Error(`El archivo no existe: ${filePath}`);
    }
    if (options.pageNum < 1) {
        logger.error(`Número de página inválido: ${options.pageNum}`);
        throw new Error('El número de página debe ser 1 o mayor.');
    }

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer, {
        pagerender: async (pageData: any) => {
          if (pageData.pagenum === options.pageNum) {
            return pageData.getTextContent();
          }
          return ''; // No renderizar otras páginas
        }
      });
      
      logger.info(`Página ${options.pageNum} del PDF [${filePath}] procesada.`);
      if (typeof pdfData.text !== 'string' || pdfData.text.trim() === '') {
         // pdf-parse con pagerender a veces devuelve un string vacío general si la página no produce texto.
         // O si la página solicitada no existe, puede devolver el texto de la primera página o estar vacío.
         // Sería bueno verificar numpages antes si es posible, o manejarlo como "no texto encontrado".
        logger.warn(`No se extrajo texto de la página ${options.pageNum} del PDF [${filePath}] o la página está vacía.`);
        // Considerar si esto debe ser un error o un string vacío. Por ahora, un string vacío.
        // Si se quiere que sea un error: throw new Error(`No se pudo extraer texto de la página ${options.pageNum} o la página está vacía.`);
        return ""; // Opcionalmente, lanzar un error si se espera texto sí o sí.
      }
      return pdfData.text;
    } catch (error: any) {
      logger.error(`Error al procesar la página ${options.pageNum} del PDF [${filePath}]: ${error.message}`);
      throw new Error(`Error al procesar la página ${options.pageNum} del PDF: ${error.message}`);
    }
  }
}