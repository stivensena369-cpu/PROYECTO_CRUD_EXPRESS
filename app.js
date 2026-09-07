// 1. IMPORTACIONES DE MÓDULOS (Las herramientas)
const express = require('express');
const sistemaArchivos = require('fs').promises; 
const ruta = require('path');
const multer = require("multer");

// 2. INICIALIZACIÓN DE LA APLICACIÓN (Crear el servidor)
const app = express();

// 3. VARIABLES DE CONFIGURACIÓN (Las reglas del lugar)
const PUERTO = process.env.PORT || 3000; 
const rutaMiArchivo = ruta.join(__dirname, 'datos.json');

// 4. CONFIGURACIÓN DE ARCHIVOS (La bodega de imágenes)
// Aquí le enseñamos a Multer dónde y cómo guardar las fotos que lleguen.
const almacen = multer.diskStorage({
  // destination: ¿En qué carpeta guardamos la foto?
  destination: (req, file, cb) => {
    // cb = callback (aviso de que terminamos). 
    // OJO: Esta carpeta llamada "mis_imagenes" debe existir en tu proyecto, de lo contrario dará error.
    cb(null, "mis_imagenes/"); 
  },
  // filename: ¿Qué nombre le ponemos al archivo para que no se repita?
  filename: (req, file, cb) => {
    // Extraemos la extensión original del archivo (ejemplo: .jpg, .png) usando la herramienta 'ruta' (path)
    const extension = ruta.extname(file.originalname);
    // Le ponemos como nombre la fecha exacta en milisegundos + su extensión (ej: 16987654321.jpg)
    cb(null, `${Date.now()}${extension}`);
  }
});

// Creamos el "portero" encargado de recibir las fotos usando las reglas que acabamos de definir.
const subir = multer({ storage: almacen });

// 5. MIDDLEWARES (Los traductores)
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// 6. RUTAS (Las ventanillas de atención)

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
// Metemos a `subir.single("imagen")` justo en medio para que atrape y guarde la foto antes de seguir.
app.post('/api/aprendices', subir.single("imagen"), async (req, res) => {
  try {
    const datosAprendiz = req.body;
    

    
    // Revisamos si el "portero" (Multer) nos guardó un archivo. 
    // Si sí, asignamos la ruta de la foto al campo 'imagen'. Si no, le ponemos "sin imagen".
    datosAprendiz.imagen = req.file ? `/mis_imagenes/${req.file.filename}` : "sin imagen";

    if (!datosAprendiz || Object.keys(datosAprendiz).length === 0) {
      return res.status(400).json({ error: 'Faltan los datos del aprendiz' });
    }

    const datos = await sistemaArchivos.readFile(rutaMiArchivo, 'utf-8');
    const listaAprendices = JSON.parse(datos);
    
    listaAprendices.push(datosAprendiz);
    
    await sistemaArchivos.writeFile(rutaMiArchivo, JSON.stringify(listaAprendices, null, 2));
    
    res.status(201).json({ mensaje: 'Aprendiz creado exitosamente', datos: datosAprendiz });
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