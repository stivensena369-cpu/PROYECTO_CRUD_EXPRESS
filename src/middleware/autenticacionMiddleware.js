const jwtoken = require("jsonwebtoken");

const autenticacion = (req, res, next) => {
    // 1. Capturamos el token del header "campoAutenticar"
    const token = req.header("campoAutenticar")?.split(" ")[1];
    
    // 2. Si NO hay token, detenemos el acceso inmediatamente
    if (!token) {
        return res.status(401).json({ Mensaje: "Acceso negado, no provee token" });
    }

    // 3. Si SÍ hay token, procedemos a verificarlo
    jwtoken.verify(token, process.env.JWT_SECRETO, (error, usuario) => {
        if (error) {
            return res.status(403).json({ Mensaje: "Token inválido" });
        }
        
        req.usuario = usuario;
        next();
    });
};

module.exports = autenticacion;