var express         = require("express"),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    path            = require('path'),
    logger          = require("./logger"),
    app             = express();
    
logger.info('iniciando todo el entorno...');

// Vistas y plantillas
app.set('views', path.join(__dirname, 'vistas'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'publico')));
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Parseadores
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

logger.info('Middlewares cargados...');

// Controlador
var controlIndex = require('./controladores/index');
var controlPeliculas = require('./controladores/peliculas');

logger.info('Controladores cargados...');

// Rutas Front
var router = express.Router();

router.route("/")
    .get(controlIndex.mostrarIndex);
app.use(router);

logger.info('Rutas Front cargadas...');

// Rutas API
var peliculas = express.Router();

peliculas.route('/peliculas')
  .get(controlPeliculas.mostrarPeliculas)
  .post(controlPeliculas.sumarPelicula);

peliculas.route('/peliculas/:id')
  .get(controlPeliculas.buscarPeliculaID)
  .put(controlPeliculas.actualizarPelicula)
  .delete(controlPeliculas.borrarPelicula);

app.use('/api', peliculas);

logger.info('Rutas API cargadas...');

// Arrancando Servidor
app.listen(process.env.PORT, process.env.IP, function() {
  logger.info("Servidor levantado con exito en http://localhost:"+process.env.PORT);
});
