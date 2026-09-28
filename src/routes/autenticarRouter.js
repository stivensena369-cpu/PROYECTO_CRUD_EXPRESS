const { Router } = require("express")

const enrutadorAuth = Router()
//importacion del controlador
const {iniciarSesion, registrarse} = require("../controllers/autenticarController")
//const registrarse = require("../controllers/autenticarController")

//Ruta de registro en el sistema
enrutadorAuth.post("/registro", registrarse)

//Ruta de inicio de sesion
enrutadorAuth.post("/login", iniciarSesion)

//re realizan todas la rutas, con (POST, PUT, DELETE)
module.exports = enrutadorAuth