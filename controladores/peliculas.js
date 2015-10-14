var fs = require('fs'),
    http = require('http'),
    Firebase = require("firebase"),
    omdb = require("omdb"),
    config = require('../config'),
    logger = require("../logger");

var myFirebaseRef = new Firebase("https://" + config.firebaseApp + ".firebaseio.com/" + config.firebaseAppRuta);

//GET - Devolviendo todas las películas
exports.mostrarPeliculas = function(req, res) {
    logger.info("Peticion GET en /api/peliculas");
    myFirebaseRef.once("value", function(snapshot) {
        logger.warn("Respuesta (200) - JSON Enviado");
        return res.status(200).jsonp(snapshot.val());
    }, function(errorObject) {
        if (errorObject) {
            logger.error("Respuesta (500) - Error en petición", {
                datos: errorObject
            });
            return res.status(500).send("Error en petición");
        }
    });

};

//GET - Devolviendo una película con ID específico
exports.buscarPeliculaID = function(req, res) {
    logger.info("Peticion GET en /api/peliculas/" + req.params.id);
    myFirebaseRef.orderByChild("details/imdbID").equalTo(req.params.id).once("value", function(snapshot) {
        logger.warn("Respuesta (200) - JSON Enviado");
        return res.status(200).jsonp(snapshot.val());
    }, function(errorObject) {
        if (errorObject) {
            logger.error("Respuesta (500) - Error en petición", {
                datos: errorObject
            });
            return res.status(500).send("Error en petición");
        }
    });
};

//POST - Insertando una nueva película
exports.sumarPelicula = function(req, res) {
    logger.info("Peticion POST en /api/peliculas/");
    omdb.get({
        title: req.body.nombre
    }, true, function(err, pelicula) {

        if (err || !pelicula) {
            logger.error("Respuesta (500) - Error en petición: " + req.body.nombre, {
                datos: err
            });
            return res.status(500).send(err || "Pelicula no encontrada");
        }
        
        // Rectificando los valores de OMBD
        pelicula.imdbID = pelicula.imdb.id;
        pelicula.year = pelicula.year.from || pelicula.year;

        // Guardar los posters
        if (pelicula.poster) {
            pelicula.posterSolution = pelicula.imdb.id + ".jpg";
            var file = fs.createWriteStream('./publico/img/' + pelicula.imdbID + '.jpg');
            var request = http.get(pelicula.poster, function(response) {
                response.pipe(file);
                logger.warn("Poster de la pelicula " + pelicula.imdb.id + " guardado en /publico/img/ como " + pelicula.imdbID + ".jpg");
            }).on('error', function(e) {
                pelicula.posterSolution = false;
                logger.error("Poster de la película " + pelicula.imdb.id + " no se pudo guardar.", {
                    datos: e
                });
            });
        } else {
            pelicula.posterSolution = false;
            logger.error("La película " + pelicula.imdb.id + " no tiene poster asociado.");
        }
        console.log(pelicula.year)
        myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
            if (error) {
                logger.error("Error al guardar los datos en Firebase (relacionado con Token).", {
                    datos: error
                });
            } else {
                logger.info("Autentificación (via Token) lograda con exito.", {
                    datos: authData
                });
                myFirebaseRef.child(pelicula.imdbID).set({
                    name: pelicula.title,
                    details: pelicula
                }, function() {
                    logger.warn("La pelicula (" + pelicula.imdb.id + ") " + pelicula.title + " guardada con exito en Firebase");
                    res.status(200).send(pelicula.title + " añadida con exito");
                });
            }
        });
    });
};

//PUT - Actualizando una película existente
exports.actualizarPelicula = function(req, res) {
    logger.info("Peticion PUT en /api/peliculas/" + req.params.id);
    omdb.get({
        imdb: req.params.id
    }, true, function(err, pelicula) {

        if (err || !pelicula) {
            logger.error("Respuesta (500) - Error en petición: " + req.params.id, {
                datos: err
            });
            return res.status(500).send(err || "Pelicula no encontrada");
        }

        // Rectificando los valores de OMBD
        pelicula.imdbID = pelicula.imdb.id;
        pelicula.year = pelicula.year.from || pelicula.year;

        // Guardar los posters
        if (pelicula.poster) {
            pelicula.posterSolution = pelicula.imdb.id + ".jpg";
            var file = fs.createWriteStream('./publico/img/' + pelicula.imdbID + '.jpg');
            var request = http.get(pelicula.poster, function(response) {
                response.pipe(file);
                logger.warn("Poster de la pelicula " + pelicula.imdb.id + " guardado en /publico/img/ como " + pelicula.imdbID + ".jpg");
            }).on('error', function(e) {
                pelicula.posterSolution = false;
                logger.error("Poster de la película " + pelicula.imdb.id + " no se pudo guardar.", {
                    datos: e
                });
            });
        } else {
            pelicula.posterSolution = false;
            logger.error("La película " + pelicula.imdb.id + " no tiene poster asociado.");
        }

        myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
            if (error) {
                logger.error("Error al guardar los datos en Firebase (relacionado con Token).", {
                    datos: error
                });
            } else {
                logger.info("Autentificación (via Token) lograda con exito.", {
                    datos: authData
                });
                myFirebaseRef.child(pelicula.imdbID).set({
                    name: req.body.nombre,
                    nameOriginal: pelicula.title,
                    details: pelicula
                }, function() {
                    logger.warn("La pelicula (" + pelicula.imdb.id + ") " + pelicula.title + " guardada con exito en Firebase");
                    res.status(200).send(pelicula.title + " - Actualización realizada con exito");
                });
            }
        });
    });
};

//DELETE - Borrando una película existente
exports.borrarPelicula = function(req, res) {
    logger.info("Peticion DELETE en /api/peliculas/" + req.params.id);
    myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
        if (error) {
            logger.error("Error al guardar los datos en Firebase (relacionado con Token).", {
                datos: error
            });
        } else {
            logger.info("Autentificación (via Token) lograda con exito.", {
                datos: authData
            });
            fs.unlink('./publico/img/' + req.params.id + '.jpg', function(err) {
                if (err) {
                    if (err.errno == 34) {
                        logger.error("Error al borrar la imagen /publico/img/" + req.params.id + ".jpg. La imagen no existe", {
                            datos: err
                        });
                    } else {
                        logger.error("Error al borrar la imagen /publico/img/" + req.params.id + ".jpg", {
                            datos: err
                        });
                    }
                } else {
                    logger.info("./publico/img/" + req.params.id + ".jpg - eliminado con exito");
                }
            });

            myFirebaseRef.child(req.params.id).remove();
            logger.info("borrado realizado con exito");
            res.status(200).send("borrado realizado con exito");
        }
    });
};