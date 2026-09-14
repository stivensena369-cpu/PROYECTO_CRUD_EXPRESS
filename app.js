// 1. IMPORTACIONES DE MÓDULOS
const express = require('express');
const sistemaArchivos = require('fs').promises; 
const ruta = require('path');
const multer = require("multer");

// Middleware de registro (Historial)
const registroMiddleware = require("./middleware/registroMiddleware");

// Middleware de validaciones
const { validarAprendiz } = require("./validacioncv/validaciones");

// 2. INICIALIZACIÓN
const app = express();

// 3. CONFIGURACIÓN
const PUERTO = process.env.PORT || 3000;
const rutaMiArchivo = ruta.join(__dirname, 'datos.json');

// 4. CONFIGURACIÓN DE MULTER
const almacen = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "mis_imagenes/"); 
  },
  filename: (req, file, cb) => {
    const extension = ruta.extname(file.originalname);
    cb(null, `${Date.now()}${extension}`);
  }
});

const subir = multer({ storage: almacen });

// 5. MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(registroMiddleware); // Muestra el [Historial] en consola

// 6. RUTAS

// Ventanilla de Bienvenida
app.get('/', (_, res) => {
  res.send('API REST Full con Express');
});

// GET: OBTENER la lista completa
app.get('/api/aprendices', async (req, res) => {
  try {
    const datos = await sistemaArchivos.readFile(rutaMiArchivo, 'utf-8');
    const listaAprendices = JSON.parse(datos);
    res.status(200).json({ listado: listaAprendices });
  } catch (error) {
    console.error('Error al leer el archivo:', error);
    res.status(500).json({ error: 'No se puede leer el archivo de datos' });
  }
});

// POST: CREAR un nuevo aprendiz
app.post('/api/aprendices', subir.single("imagen"), validarAprendiz, async (req, res) => {
  try {
    const { id, nombre, correo } = req.body;

    const datosAprendiz = {
      id,
      nombre: nombre.trim(),
      correo: correo.trim(),
      imagen: req.file ? `/mis_imagenes/${req.file.filename}` : "sin imagen"
    };

    const datos = await sistemaArchivos.readFile(rutaMiArchivo, 'utf-8');
    const listaAprendices = JSON.parse(datos);
    
    listaAprendices.push(datosAprendiz);
    
    await sistemaArchivos.writeFile(rutaMiArchivo, JSON.stringify(listaAprendices, null, 2));
    
    res.status(201).json({
      exito: true,
      mensaje: 'Aprendiz creado exitosamente',
      datos: datosAprendiz
    });

  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error interno al intentar guardar el aprendiz' });
  }
});

// PUT: ACTUALIZAR aprendiz
app.put('/api/aprendices/:id_aprendices', (req, res) => {
  res.status(200).json({ mensaje: 'Actualizar aprendiz' });
});

// DELETE: ELIMINAR aprendiz
app.delete('/api/aprendices/:id_aprendices', (req, res) => {
  res.status(200).json({ mensaje: 'Aprendiz eliminado' });
});

// 7. ARRANQUE DEL SERVIDOR
app.listen(PUERTO, () => {
  console.log(`Servidor en funcionamiento en el puerto: ${PUERTO}`);
});