// 1. IMPORTACIONES DE MÓDULOS

const express = require('express');
const sistemaArchivos = require('fs').promises; 
const ruta = require('path');
const multer = require("multer");
const jwt = require("jsonwebtoken"); // Necesario para generar el token en el login
require('dotenv').config(); // Carga las variables del archivo .env
const jwtoken = require("jsonwebtoken");  

// Importación de middlewares locales
const registroMiddleware = require("./src/middleware/registroMiddleware");
const { validarAprendiz } = require("./src/validacioncv/validaciones");
const manejadorErroresMiddleware = require("./src/middleware/manejandoErroresMiddleware");
const autenticacionMiddleware = require("./src/middleware/autenticacionMiddleware");

// 2. INICIALIZACIÓN
const app = express();

// 3. CONFIGURACIÓN
const PUERTO = process.env.MIPUERTO || process.env.PORT || 3000;
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

// 5. MIDDLEWARES DE EXPRESS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(registroMiddleware);

// 6. RUTAS

// Bienvenida
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

// POST: CREAR un nuevo aprendiz (con archivo e integración de middleware de validación)
app.post('/api/aprendices', subir.single("imagen"), validarAprendiz, async (req, res) => {
  try {
    const { id, nombre, correo } = req.body;

    const datosAprendiz = {
      id,
      nombre: nombre.trim(),
      correo: correo.trim(),
      imagen: req.file ? `mis_imagenes/${req.file.filename}` : "sin imagen"
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

app.get("/api/error", (req, res, next) => {
  next(new Error("Esto es un error provocado"));
});

// Ruta protegida, para acceder con token, permisos de usuario
app.get("/api/rutaprotegida", autenticacionMiddleware, (req, res) => {
  res.json({ mensaje: "Ruta Protegida, acceso con token" });
});

// RUTA DE INICIO DE SESIÓN PARA GENERAR UN TOKEN
app.post("/api/login", (req, res) => {

  //capturar datos del usuario
const {usuario, clave} = req.body
//simular datos de usuario en la BD
const bdUsuario = {"usuario": "jhonny", "contraseña":"abc123"}
//validar datos
if (usuario != bdUsuario.usuario || clave !== bdUsuario.clave){

    return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
  
  }

  const token = jwtoken.sign(
  {"user": req.usuario},
  process.env.JWT_SECRETO,
  {expiresIn:"1h"}

  )

   res.json({
    mensaje: "Login exitoso",
    token: token
  });
});


// Middleware de manejo de errores (siempre debe ir al final de todas las rutas)
app.use(manejadorErroresMiddleware);

// 7. ARRANQUE DEL SERVIDOR
app.listen(PUERTO, () => {
 console.log(`Servidor en funcionamiento en: http://localhost:${PUERTO}`);
});