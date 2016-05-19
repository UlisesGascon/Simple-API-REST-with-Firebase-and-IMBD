var fs = require('fs'),
    http = require('http'),
    Firebase = require("firebase"),
    omdb = require("omdb"),
    config = require('../config'),
    myFirebaseRef = new Firebase("https://" + config.firebaseApp + ".firebaseio.com/" + config.firebaseAppRuta),
    crier = global.crier.addGroup('movieFire');

//GET - Devolviendo todas las películas
//Ruta:  /api/peliculas
exports.mostrarPeliculas = function(gw) {
    myFirebaseRef.once("value", function(snapshot) {
        gw.json(snapshot.val(), {deep:10});
    }, function(errorObject) {
        if (errorObject) {
            gw.error(500);
        }
    });
};

//GET - Devolviendo una película con ID específico
//Ruta:  /api/peliculas/:id
exports.buscarPeliculaID = function(gw) {
    //logger.info("Peticion GET en /api/peliculas/" + req.params.id);
    myFirebaseRef.orderByChild("details/imdbID").equalTo(gw.pathParams.path).once("value", function(snapshot) {
        gw.json(snapshot.val(), {deep:10});
    }, function(errorObject) {
        if (errorObject) {
            gw.error(500);
        }
    });
};

//POST - Insertando una nueva película
//Ruta:  /api/peliculas
exports.sumarPelicula = function(gw) {
    console.log(gw.content.params.nombre);
    omdb.get({
        title: gw.content.params.nombre
    }, true, function(err, pelicula) {
        if (err || !pelicula) {
           return gw.error(404);
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
            }).on('error', function(e) {
                pelicula.posterSolution = false;
            });
        } else {
            pelicula.posterSolution = false;
        }
        console.log(pelicula.year)
        myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
            if (error) {
                crier.error("Error al guardar los datos en Firebase (relacionado con Token).", {datos: error});
            } else {
                crier.info("Autentificación (via Token) lograda con exito.", {datos: authData});
                myFirebaseRef.child(pelicula.imdbID).set({
                    name: pelicula.title,
                    details: pelicula
                }, function() {
                    gw.text(pelicula.title + " añadida con exito");
                });
            }
        });
    });
};

//PUT - Actualizando una película existente
//Ruta:  /api/peliculas:id
exports.actualizarPelicula = function(gw) {
    omdb.get({
        imdb: gw.pathParams.path
    }, true, function(err, pelicula) {

        if (err || !pelicula) {
            return gw.error(404);
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
                crier.info("Poster de la pelicula " + pelicula.imdb.id + " guardado en /publico/img/ como " + pelicula.imdbID + ".jpg");
            }).on('error', function(e) {
                pelicula.posterSolution = false;
                crier.error("Poster de la película " + pelicula.imdb.id + " no se pudo guardar.", {datos: e});
            });
        } else {
            pelicula.posterSolution = false;
        }

        myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
            if (error) {
                crier.error("Error al guardar los datos en Firebase (relacionado con Token).", {datos: error});
            } else {
                crier.info("Autentificación (via Token) lograda con exito.", {datos: authData});
                myFirebaseRef.child(pelicula.imdbID).set({
                    name: gw.content.params.nombre,
                    nameOriginal: pelicula.title,
                    details: pelicula
                }, function() {
                    gw.text(pelicula.title + " - Actualización realizada con exito");
                });
            }
        });
    });
};

//DELETE - Borrando una película existente
//Ruta:  /api/peliculas:id
exports.borrarPelicula = function(gw) {
    myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
        if (error) {
            crier.error("Error al guardar los datos en Firebase (relacionado con Token).", {datos: error});
        } else {
            crier.info("Autentificación (via Token) lograda con exito.", {datos: authData});
            fs.unlink('./publico/img/' + gw.pathParams.path + '.jpg', function(err) {
                if (err) {
                    if (err.errno == 34) {
                        crier.error("Error al borrar la imagen /publico/img/" + gw.pathParams.path + ".jpg. La imagen no existe", {datos: err});
                    } else {
                        crier.error("Error al borrar la imagen /publico/img/" + gw.pathParams.path + ".jpg", {datos: err});
                    }
                } else {
                    crier.info("./publico/img/" + gw.pathParams.path + ".jpg - eliminado con exito");
                }
            });

            myFirebaseRef.child(gw.pathParams.path).remove();
            gw.text("borrado realizado con exito");
        }
    });
};