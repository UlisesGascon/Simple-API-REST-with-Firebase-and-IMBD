var project = require('pillars'),
    path = require('path'),
    jade = require('jade');

// Starting the project
project.services.get('http').configure({
    port: process.env.PORT || 3000
}).start();

// Vistas y plantillas
var templated = global.templated;
templated.addEngine('jade', function compiler(source, path) {
    return jade.compile(source, {
        filename: path,
        pretty: false,
        debug: false,
        compileDebug: false
    });
});

// Controladores
var controlIndex = require('./controladores/index');
var controlPeliculas = require('./controladores/peliculas');

// Rutas API
var rutaApi = new Route({
        id: "api",
        path: "/api"
    },
    function(gw) {
      gw.redirect("/");
    });



var rutaApiPeliculas = new Route({
        id: "peliculas",
        path: "/api/peliculas/*:path",
        cors: true
    },
    function(gw) {
      console.log(gw)
      console.log("gw.method:" +gw.method)
      if (gw.pathParams.path === "") {
        if (gw.method === "POST") {
          
          controlPeliculas.sumarPelicula(gw);
        } else if (gw.method === "GET"){
          controlPeliculas.mostrarPeliculas(gw);
        } else {
          gw.error(405);
        }
      } else {
        if (gw.method === "GET") {
          controlPeliculas.buscarPeliculaID(gw);
        } else if (gw.method === "PUT") {
          controlPeliculas.actualizarPelicula(gw);
        } else if (gw.method === "DELETE") {
          controlPeliculas.borrarPelicula(gw);
        } else {
          gw.error(405);
        }
      }
      
    });

// Rutas FRONT
var rutaFront = new Route({
        id: "index",
        path: "/"
    },
    function(gw) {
      controlIndex.mostrarIndex(gw);
    });

var rutaEstaticos = new Route({
    id: 'estaticos',
    path: '/*:path',
    directory: {
        path: './publico',
        listing: true
    }
});

// Rutas
project.routes.add(rutaApiPeliculas);
project.routes.add(rutaApi);
project.routes.add(rutaFront);
project.routes.add(rutaEstaticos);