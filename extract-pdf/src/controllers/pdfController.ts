import { Request, Response } from 'express';
import { PdfService } from '../services/pdfService.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';

const pdfService = new PdfService();

export class PdfController {
  /**
   * Extrae el texto de un PDF subido
   */
  async extractText(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se ha proporcionado ningún archivo' });
        return;
      }

      const filePath = req.file.path;
      logger.info(`Archivo recibido: ${filePath}`);

      // Extraer el texto del PDF
      // Extraer el texto del PDF
      // const result = await pdfService.extractText(filePath); // Firma anterior
      // Nueva firma: extractText devuelve string o lanza error
      try {
        const extractedText = await pdfService.extractText(filePath);
        // Formato de respuesta MCP (adaptado para Express, aunque no es el flujo principal del error)
        res.status(200).json({
          content: [
            {
              type: "text", // Asegurarse que esto sea 'text'
              text: extractedText
            }
          ]
        });
      } catch (serviceError: any) {
        // Formato de error MCP (simplificado)
        res.status(500).json({
          error: {
            message: serviceError.message || 'Error al procesar el PDF',
          }
        });
      }

      // Eliminar el archivo después de procesarlo
      fs.unlink(filePath, (err) => {
        if (err) logger.error(`Error al eliminar el archivo temporal: ${err.message}`);
      });
    } catch (error) {
      logger.error(`Error en el controlador: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * Extrae el texto de una página específica del PDF
   */
  async extractPage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se ha proporcionado ningún archivo' });
        return;
      }

      const filePath = req.file.path;
      const pageNum = parseInt(req.query.page as string);

      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json({ success: false, message: 'Número de página inválido' });
        return;
      }

      // Extraer el texto de la página específica
      // Extraer el texto de la página específica
      // const result = await pdfService.extractWithOptions(filePath, { pageNum }); // Firma anterior
      // Nueva firma: extractWithOptions devuelve string o lanza error
      try {
        const extractedText = await pdfService.extractWithOptions(filePath, { pageNum });
        // Formato de respuesta MCP
        res.status(200).json({
          content: [
            {
              type: "text", // Asegurarse que esto sea 'text'
              text: extractedText
            }
          ]
        });
      } catch (serviceError: any) {
        // Formato de error MCP (simplificado)
        res.status(500).json({
          error: {
            message: serviceError.message || 'Error al procesar la página del PDF',
          }
        });
      }

      // Eliminar el archivo después de procesarlo
      fs.unlink(filePath, (err) => {
        if (err) logger.error(`Error al eliminar el archivo temporal: ${err.message}`);
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: (error as Error).message
      });
    }
  }
}