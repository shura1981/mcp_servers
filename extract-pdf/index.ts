#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PdfService } from './src/services/pdfService.js';
import { logger } from './src/utils/logger.js';
'../middlewares/upload'
// Obtener el equivalente a __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar variable de entorno para evitar errores con pdf-parse
process.env.PDF_TEST_SKIP = 'true';

// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Crear directorios necesarios si no existen
const uploadsDir = path.join(__dirname, 'uploads');
const logsDir = path.join(__dirname, 'logs');
const testDataDir = path.join(__dirname, 'test', 'data');

// Asegurarse de que existan las carpetas necesarias
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info(`Directorio de uploads creado: ${uploadsDir}`);
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info(`Directorio de logs creado: ${logsDir}`);
}

if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
  logger.info(`Directorio de datos de prueba creado: ${testDataDir}`);
}

class PdfExtractorServer {
  private server: Server;
  private pdfService: PdfService;

  constructor() {
    this.server = new Server(
      {
        name: 'pdf-extractor',
        version: '1.0.0'
      },
      {
        capabilities: {
          resources: {},
          tools: {}
        }
      }
    );

    // Crear instancia del servicio de PDF
    this.pdfService = new PdfService();

    this.setupToolHandlers();

    // Manejo de errores y cierre controlado
    this.server.onerror = (error) => logger.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.shutdown();
    });
    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
  }

  private setupToolHandlers() {
    // --- List Tools ---
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Respondiendo a ListToolsRequest');
      // Definir las herramientas que ofrece el servidor
      return {
        tools: [
          {
            name: 'extract_text', // RENOMBRADO
            description: 'Extrae todo el texto de un archivo PDF.',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Ruta completa al archivo PDF.',
                },
              },
              required: ['filePath'],
            }
          },
          {
            name: 'health_check',
            description: 'Verifica el estado del servicio de extracción de PDF.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        ],
      };
    });

    // --- Call Tool ---
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      logger.info(`Recibida llamada a tool: ${request.params.name}`);

      // Herramienta para verificar el estado del servicio
      if (request.params.name === 'health_check') {
        try {
          logger.info('Ejecutando health check...');
          return {
            content: [
              {
                type: 'text', // CORREGIDO: Debería ser 'text' si el contenido es una cadena JSON.
                text: JSON.stringify({
                  status: 'OK',
                  message: 'Servicio de extracción de PDF funcionando correctamente',
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ],
          };
        } catch (error: any) {
          logger.error("Error en health check:", error);
          return {
            content: [
              {
                type: 'text',
                text: `Error en health check: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
      
      // Herramienta para extraer todo el texto de un PDF
      else if (request.params.name === 'extract_text') { // RENOMBRADO
        const args = request.params.arguments;
        
        logger.info('Argumentos recibidos:', JSON.stringify(args, null, 2));
        
        if (typeof args !== 'object' || args === null || typeof args.filePath !== 'string') {
          logger.error('Argumentos inválidos:', args);
          throw new McpError(ErrorCode.InvalidParams, 'Argumentos inválidos: se requiere "filePath" (string).');
        }
        
        const filePath = args.filePath;
        
        logger.info(`Extrayendo texto del PDF: ${filePath}`);

        try {
          // Verificar que el archivo existe
          if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo no existe: ${filePath}`);
          }
          
          // Extraer el texto del PDF
          const extractedText = await this.pdfService.extractText(filePath);
          
          // Si llegamos aquí, la extracción fue exitosa y extractedText es un string.
          logger.info('!!!!!!!!!!!!!!!!!! DEBUG: Preparando respuesta para extract_text !!!!!!!!!!!!!!!!!!'); // RENOMBRADO
          logger.info(`!!!!!!!!!!!!!!!!!! DEBUG: Tipo de contenido será: text !!!!!!!!!!!!!!!!!!`);
          logger.info(`!!!!!!!!!!!!!!!!!! DEBUG: Texto extraído (primeros 100 chars): ${extractedText.substring(0,100)} !!!!!!!!!!!!!!!!!!`);
          return {
            content: [
              {
                type: 'text',
                text: extractedText
              }
            ]
          };
        } catch (error: any) {
          logger.error(`Error al extraer texto del PDF [${filePath}]: ${error.message}`);
          // Devolver un error formateado para MCP
          throw new McpError(ErrorCode.InternalError, `Error al extraer texto del PDF: ${error.message}`);
        }
      }
      
      // Herramienta para extraer texto de una página específica
      else if (request.params.name === 'extract_page') {
        const args = request.params.arguments;
        
        logger.info('Argumentos recibidos:', JSON.stringify(args, null, 2));
        
        if (typeof args !== 'object' || args === null || 
            typeof args.filePath !== 'string' || 
            typeof args.pageNum !== 'number') {
          logger.error('Argumentos inválidos:', args);
          throw new McpError(ErrorCode.InvalidParams, 'Argumentos inválidos: se requieren "filePath" (string) y "pageNum" (number).');
        }
        
        const { filePath, pageNum } = args;
        
        logger.info(`Extrayendo texto de la página ${pageNum} del PDF: ${filePath}`);

        try {
          // Verificar que el archivo existe
          if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo no existe: ${filePath}`);
          }
          
          // Verificar que el número de página es válido
          if (pageNum < 1) {
            throw new Error('El número de página debe ser mayor o igual a 1');
          }
          
          // Extraer el texto de la página específica
          const extractedText = await this.pdfService.extractWithOptions(filePath, { pageNum });

          // Si llegamos aquí, la extracción fue exitosa.
          return {
            content: [
              {
                type: 'text',
                text: extractedText
              }
            ],
          };
        } catch (error: any) {
          logger.error(`Error al extraer texto de la página ${pageNum} del PDF [${filePath}]: ${error.message}`);
          // Devolver un error formateado para MCP
          throw new McpError(ErrorCode.InternalError, `Error al extraer texto de la página ${pageNum} del PDF: ${error.message}`);
        }
      } else {
        logger.error(`Herramienta no reconocida: ${request.params.name}`);
        throw new McpError(ErrorCode.MethodNotFound, `Herramienta desconocida: ${request.params.name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    logger.info('Conectando transporte...');
    await this.server.connect(transport);
    logger.info('PDF Extractor MCP server running on stdio');
  }

  async shutdown() {
    logger.info('Cerrando servidor MCP de extracción de PDF...');
    await this.server.close();
    logger.info('Servidor MCP cerrado.');
    process.exit(0);
  }
}

const server = new PdfExtractorServer();
server.run().catch(error => {
  logger.error("Error al iniciar el servidor:", error);
  process.exit(1);
});