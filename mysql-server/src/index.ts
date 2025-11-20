#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise'; // Import the mysql2 library

// Database connection details (will be loaded from environment variables)
const DB_HOST = process.env.MYSQL_HOST || "localhost";
const DB_USER = process.env.MYSQL_USER || "crisenri_intranet";
const DB_PASSWORD = process.env.MYSQL_PASSWORD || "].wKbv44W4LW8b";
const DB_DATABASE = process.env.MYSQL_DATABASE || "crisenri_task_management_system";
const DB_PORT = parseInt(process.env.MYSQL_PORT || "3306", 10);

// Mejorar logging para diagnóstico
console.error(`Conectando a MySQL: ${DB_HOST}:${DB_PORT} como ${DB_USER} (base de datos: ${DB_DATABASE})`);

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
  console.error('Missing required MySQL environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE)');
  process.exit(1);
}

class MysqlServer {
  private server: Server;
  private dbPool: mysql.Pool | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'mysql-server', 
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {}, 
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    // Error handling and graceful shutdown
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.shutdown();
    });
    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
  }

  private async initializeDbPool() {
    try {
      console.error('Intentando crear pool de conexiones...');
      
      this.dbPool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        port: DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // Añadir configuración adicional para debug
        debug: process.env.DEBUG_MYSQL === 'true',
        // Aumentar el timeout de la conexión
        connectTimeout: 10000,
        // Desactivar la preparación automática para permitir cualquier consulta
        multipleStatements: true,
        // Permitir la creación y ejecución de procedimientos almacenados
        supportBigNumbers: true,
        bigNumberStrings: true
      });
      
      // Test the connection
      console.error('Obteniendo conexión de prueba...');
      const connection = await this.dbPool.getConnection();
      console.error('Conexión obtenida. Ejecutando consulta de prueba...');
      
      // Ejecutar una consulta de prueba simple
      const [testResult] = await connection.query('SELECT 1 as test');
      console.error('Consulta de prueba exitosa:', testResult);
      
      connection.release();
      console.error('Successfully connected to the database. Connection test passed.');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      // Exit if DB connection fails on startup
      process.exit(1); 
    }
  }

  private setupToolHandlers() {
    // --- List Tools ---
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('Respondiendo a ListToolsRequest');
      // Define the tools your server will offer here
      return {
        tools: [
          {
            name: 'execute_query',
            description: 'Executes any SQL query against the configured MySQL/MariaDB database without validation. Supports stored procedures and all MySQL commands.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The SQL query to execute. Can be any valid MySQL query including SHOW TABLES, CREATE PROCEDURE, CALL, DROP, etc.',
                },
                delimiter: {
                  type: 'string',
                  description: 'Optional delimiter to use for stored procedure creation (default is ";")',
                }
              },
              required: ['query'],
            },
          },
          {
            name: 'test_connection',
            description: 'Tests the database connection with a simple query.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          }
        ],
      };
    });

    // --- Call Tool ---
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error(`Recibida llamada a tool: ${request.params.name}`);
      
      if (!this.dbPool) {
         throw new McpError(ErrorCode.InternalError, 'Database pool not initialized.');
      }

      // Herramienta de prueba de conexión simple
      if (request.params.name === 'test_connection') {
        try {
          console.error('Ejecutando test de conexión...');
          const [results] = await this.dbPool.query('SELECT 1 as test');
          console.error('Test de conexión exitoso:', results);
          return {
            content: [
              {
                type: 'application/json',
                text: JSON.stringify({ message: 'Connection successful', results }, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error en test de conexión:", error);
          return {
            content: [
              {
                type: 'text',
                text: `Error testing connection: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      }
      
      // Herramienta para ejecutar consultas
      else if (request.params.name === 'execute_query') {
        const args = request.params.arguments;
        
        console.error('Argumentos recibidos:', JSON.stringify(args, null, 2));
        
        if (typeof args !== 'object' || args === null || typeof args.query !== 'string') {
          console.error('Argumentos inválidos:', args);
          throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments: "query" (string) is required.');
        }
        
        const query = args.query;
        const delimiter = args.delimiter || ';';
        
        console.error(`Ejecutando consulta: ${query}`);
        console.error(`Usando delimitador: ${delimiter}`);

        try {
          // Handle stored procedures by checking if the query contains DELIMITER
          if (query.toUpperCase().includes('DELIMITER') || query.toUpperCase().includes('CREATE PROCEDURE') || query.toUpperCase().includes('CREATE FUNCTION')) {
            console.error('Detectada posible definición de procedimiento almacenado');
            // For stored procedures, we might need to handle the query differently
            // Execute directly without worrying about results format
            const connection = await this.dbPool.getConnection();
            try {
              // Handle the query as raw SQL
              await connection.query(query);
              connection.release();
              
              return {
                content: [
                  {
                    type: 'application/json',
                    text: JSON.stringify({ 
                      message: 'Stored procedure or function operation executed successfully',
                      success: true
                    }, null, 2),
                  },
                ],
              };
            } catch (error: any) {
              connection.release();
              throw error; // Re-throw to be caught by the outer try-catch
            }
          } else {
            // Standard query execution
            const [results, fields] = await this.dbPool.query(query);
            
            console.error(`Consulta exitosa. Filas afectadas/devueltas: ${Array.isArray(results) ? results.length : (results as any).affectedRows || 0}`);
            
            // Formatear los resultados de manera más legible
            let formattedResults = '';
            if (Array.isArray(results) && results.length > 0) {
              // Obtener los nombres de las columnas
              const columns = Object.keys(results[0]);
              // Crear una tabla con los resultados
              formattedResults = columns.join('\t') + '\n';
              formattedResults += '-'.repeat(columns.join('\t').length) + '\n';
              results.forEach((row: any) => {
                formattedResults += columns.map(col => String(row[col] ?? '')).join('\t') + '\n';
              });
            } else {
              formattedResults = JSON.stringify(results, null, 2);
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: formattedResults,
                },
              ],
            };
          }
        } catch (error: any) {
           console.error("Error executing query:", error);
           // Return a structured error message
           return {
             content: [
               {
                 type: 'text',
                 text: `Error executing query: ${error.message}\nSQL: ${query}${query.toUpperCase().includes('CREATE PROCEDURE') ? '\nNota: Para procedimientos almacenados, asegúrate de usar DELIMITER correctamente' : ''}`,
               },
             ],
             isError: true,
           };
        }
      } else {
        console.error(`Tool no reconocida: ${request.params.name}`);
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  async run() {
    await this.initializeDbPool(); // Initialize DB pool before connecting transport
    const transport = new StdioServerTransport();
    console.error('Conectando transporte...');
    await this.server.connect(transport);
    console.error('MySQL MCP server running on stdio');
  }

  async shutdown() {
    console.error('Shutting down MySQL MCP server...');
    if (this.dbPool) {
      await this.dbPool.end();
      console.error('Database pool closed.');
    }
    await this.server.close();
    console.error('MCP server closed.');
    process.exit(0);
  }
}

const server = new MysqlServer();
server.run().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});