// 1. IMPORTACIONES DE MÓDULOS (Las herramientas que vamos a usar)
// express: Nuestro programa principal para crear el servidor web.
const express = require('express');
// fs (File System): La herramienta para abrir, leer y guardar archivos. Usamos promises para que espere su turno ordenadamente.
const sistemaArchivos = require('fs').promises; 
// path: Una brújula que nos ayuda a encontrar la ruta exacta de los archivos en tu computadora.
const ruta = require('path');
// multer: Herramienta extra que sirve para recibir archivos (como fotos o PDFs) que envíen los usuarios.
// (Nota: Corregí el nombre a 'multer' porque decía 'multe' y eso te daría un error al ejecutarlo)
const multer = require("multer");

// 2. INICIALIZACIÓN DE LA APLICACIÓN (Crear el servidor)
// Al llamar a express(), creamos nuestro servidor y lo guardamos en la variable 'app'.
const app = express();

// 3. VARIABLES DE CONFIGURACIÓN (Las reglas del lugar)
// PUERTO: La "puerta" por donde el servidor atenderá. Usa la que asigne tu hosting de internet, o la 3000 por defecto.
const PUERTO = process.env.PORT || 3000; 
// rutaMiArchivo: Le dice al servidor la dirección exacta del archivo 'datos.json' donde guardaremos la información.
const rutaMiArchivo = ruta.join(__dirname, 'datos.json');

// 4. MIDDLEWARES (Los traductores / recepcionistas)
// express.json(): Le enseña al servidor a entender los datos que llegan en formato JSON moderno.
app.use(express.json());
// express.urlencoded(): Le enseña al servidor a entender datos que vienen de formularios web tradicionales.
app.use(express.urlencoded({extended:true}))

// 5. RUTAS (Las ventanillas de atención)

// Ventanilla de Bienvenida: Si alguien entra a la página principal ('/'), simplemente lo saludamos.
app.get('/', (_, res) => {
  res.send('API REST Full con Express');
});

// GET: Ventanilla para OBTENER la lista completa de aprendices
app.get('/api/aprendices', async (req, res) => {
  try {
    // 1. Abre y lee todo el contenido del archivo datos.json
    const datos = await sistemaArchivos.readFile(rutaMiArchivo, 'utf-8');
    // 2. Convierte ese texto en una lista real de JavaScript que el sistema entienda
    const listaAprendices = JSON.parse(datos);
    
    // 3. Se la envía al usuario con un mensaje de éxito (código 200)
    res.status(200).json({ listado: listaAprendices });
  } catch (error) {
    // Si el archivo no existe o está dañado, pide disculpas con un error 500
    console.error('Error al leer el archivo:', error);
    res.status(500).json({ error: 'No se puede leer el archivo de datos' });
  }
});

// POST: Ventanilla para CREAR un nuevo aprendiz y guardarlo en el archivo
app.post('/api/aprendices', async (req, res) => {
  try {
    // 1. Tomamos los datos que el usuario nos acaba de enviar
    const datosAprendiz = req.body;

    // 2. Revisamos que no nos haya mandado un formulario vacío (Error 400 si falta información)
    if (!datosAprendiz || Object.keys(datosAprendiz).length === 0) {
      return res.status(400).json({ error: 'Faltan los datos del aprendiz' });
    }

    // 3. Abrimos la lista actual de aprendices
    const datos = await sistemaArchivos.readFile(rutaMiArchivo, 'utf-8');
    const listaAprendices = JSON.parse(datos);

    // 4. Metemos al nuevo aprendiz al final de esa lista
    listaAprendices.push(datosAprendiz);

    // 5. Sobrescribimos el archivo 'datos.json' guardando la lista ya actualizada
    await sistemaArchivos.writeFile(rutaMiArchivo, JSON.stringify(listaAprendices, null, 2));
    
    // 6. Avisamos que todo salió perfecto y que el aprendiz fue creado (código 201)
    res.status(201).json({ mensaje: 'Aprendiz creado exitosamente', datos: datosAprendiz });
  } catch (error) {
    // Si algo falla al guardar, enviamos un error 500 para evitar que el servidor se apague
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error interno al intentar guardar el aprendiz' });
  }
});

// PUT: Ventanilla para ACTUALIZAR o MODIFICAR un aprendiz que ya existe
app.put('/api/aprendices/:id_aprendices', (req, res) => {
  // El ':id_aprendices' en la ruta funciona como una variable para saber a qué persona específica actualizar.
  // Por ahora es solo un cascarón que devuelve un mensaje de prueba.
  res.status(200).json({ mensaje: 'Actualizar aprendiz' });
});

// DELETE: Ventanilla para ELIMINAR a un aprendiz de la lista
app.delete('/api/aprendices/:id_aprendices', (req, res) => {
  // Igual que arriba, recibe el ID del aprendiz a borrar y devuelve un mensaje de prueba confirmando que la ruta funciona.
  res.status(200).json({ mensaje: 'Aprendiz eliminado' });
});

// 6. ARRANQUE DEL SERVIDOR (Encender la máquina)
app.listen(PUERTO, () => {
  // Le da la orden al servidor de encenderse y quedarse esperando visitas. 
  // Nos avisa en la consola que ya está listo y funcionando.
  console.log(`Servidor en funcionamiento en el puerto: ${PUERTO}`);
});