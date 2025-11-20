#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createExcelMcpServer } from './server.js';

/**
 * Punto de entrada principal del servidor MCP para Excel
 * Configura el transporte stdio y arranca el servidor
 */
async function main(): Promise<void> {
  try {
    // Crear el servidor MCP
    const server = createExcelMcpServer();

    // Configurar el transporte stdio
    const transport = new StdioServerTransport();

    // Conectar el servidor al transporte
    await server.connect(transport);

    // Manejar el cierre graceful
    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.close();
      process.exit(0);
    });

    // Log para debugging (va a stderr, no interfiere con MCP)
    console.error('Servidor MCP para Excel iniciado correctamente');
  } catch (error) {
    console.error('Error al iniciar el servidor MCP:', error);
    process.exit(1);
  }
}

// Ejecutar el servidor
main();
