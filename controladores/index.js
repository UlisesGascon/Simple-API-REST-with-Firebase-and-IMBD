var logger = require("../logger");

//GET - Devolviendo todas las películas
exports.mostrarIndex = function(req, res){
  logger.info("Nueva petición en / ");
  logger.warn("Renderizando el Index");
  res.render('index');
};