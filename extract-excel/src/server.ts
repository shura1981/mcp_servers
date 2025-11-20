import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerExtractExcelTool, registerCreateExcelTool } from './tools/index.js';

/**
 * Crea y configura el servidor MCP para Excel
 * Registra todas las herramientas disponibles
 */
export function createExcelMcpServer(): McpServer {
  const server = new McpServer({
    name: 'extract-excel-mcp-server',
    version: '1.0.0',
  });

  // Registrar herramientas
  registerExtractExcelTool(server);
  registerCreateExcelTool(server);

  return server;
}
