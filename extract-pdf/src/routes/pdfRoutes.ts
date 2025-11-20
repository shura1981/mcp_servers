import express from 'express';
import { PdfController } from '../controllers/pdfController.js';
import { upload } from '../middlewares/upload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const pdfController = new PdfController();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Ruta para extraer todo el texto de un PDF
router.post('/extract', upload.single('pdf'), (req, res) => {
  pdfController.extractText(req, res);
});

// Ruta para extraer el texto de una página específica
router.post('/extract/page', upload.single('pdf'), (req, res) => {
  pdfController.extractPage(req, res);
});

// Ruta para verificar el estado del servicio
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servicio funcionando correctamente' });
});

export default router;