![dependencies](https://david-dm.org/UlisesGascon/Simple-API-REST-with-Firebase-and-IMBD.svg)

# Simple API REST con [Firebase](https://www.firebase.com/) y [OMBD](http://omdbapi.com/)

Este script está diseñado como contenido académico para el [curso de Node.js](http://www.fictizia.com/formacion/curso_nodejs) de [Fictizia](http://www.fictizia.com/). 

El objetivo de este repositorio es mostrar cómo desarrollar una API Rest sencilla usando [Firebase](https://www.firebase.com/) como base de datos y enriqueciendo los datos con [OMBD](http://omdbapi.com/)

Este script permite al usuario introducir el nombre completo o solo parte de la película que queramos y Nodejs se encargará de buscar todos los detalles (Nombre completo, director, actores, países, argumento, poster, etc...) y actualizar la base de datos (Firebase) con esta información.

El script funciona usando un API Rest, lo que nos permite gestionar el contenido independientemente de la interfaz. En este script ya se incluye un cliente listo para que gestionemos todo desde un entorno visual (usando Bootstrap).


### Agradecimientos

La parte front del proyecto se basa en la evolución del [repositorio](https://github.com/arvindr21/movieFire) de [Arvind Ravulavaru](https://twitter.com/arvindr21), [The Jackal of Javascript](http://thejackalofjavascript.com). Podéis leer el [artículo completo en su blog](http://thejackalofjavascript.com/getting-started-with-firebase/).

Para el enriquecimiento de datos con la información de las películas, utilizamos [OMBD](http://omdbapi.com/), pero a través de la [librería de Misterhat](https://github.com/misterhat/omdb)

Para la gestión de los errores, he utilizado [Winston](https://github.com/winstonjs/winston). He utilizado una configuración similar al artículo [Advance logging with Nodejs](http://tostring.it/2014/06/23/advanced-logging-with-nodejs/) de [Ugo Lattanzi](https://twitter.com/imperugo)


### Dependencias:

**Backend**

- [Express (4.13.3)](https://www.npmjs.com/package/express)
- [Body-parser (1.5.1)](https://www.npmjs.com/package/body-parser)
- [Method-override (2.1.2)](https://www.npmjs.com/package/method-override)
- [Jade (1.11.0)](https://www.npmjs.com/package/jade)
- [Omdb (0.3.1)](https://github.com/misterhat/omdb)
- [Firebase (2.3.1)](https://www.npmjs.com/package/firebase)
- [Winston (1.1.0)](https://github.com/winstonjs/winston)

**Frontend**

- [Firebase Client (1.0.15)](https://www.firebase.com)
- [Jquery (1.11.3)](https://jquery.com)
- [Bootstrap (3.3.5)](http://getbootstrap.com/)


**Instalar dependencias**

```
npm install
```


### Front

Por defecto al desplegar nuestro servidor Express renderiza una página que nos permite interactuar con el API sin salirnos del entorno visual.

![Interfaz](/doc/movie_fire.png)

Además de la lista de las películas presentes en Firebase, que se actualiza en tiempo real gracias al uso de websockets (Nodejs < -(Express)-> Cliente directo <- (Web Sockets) Firebase <-(API)-> Nodejs). Podemos ver los detalles de cada película en un Modal.

![Interfaz detalles](/doc/movie_fire_details.png)

Además se incluye la opción de manejar el API desde la consola del navegador usando la función *llamarAPI*

```javascript
// Hackers ID: tt0113243

// Cambiar el nombre de Hackers en la lista (método PUT, datos {nombre: "lo que sea"})
llamarAPI ("PUT", "tt0113243", "lo que sea" );

// Borrar Hackers
llamarAPI ("DELETE", "tt0113243");

// Añadir Hackers
llamarAPI ("POST", "" ,"Hackers");
```


### Rutas API

Imaginemos que nuestro script está funcionando en localhost bajo el puerto 3000. 

**Headers CORS**

El [CORS](http://www.wikiwand.com/en/Cross-origin_resource_sharing) está habilitado, así que se pueden hacer peticiones a nuestra API desde otros dominios.

```javascript
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
```

**Rutas Front**

- http://locahost:3000/  -> Renderizará el Index.jade y nos dejará trabajar con el entorno visual.

**Rutas API**

- [GET] http://locahost:3000/api/peliculas -> Muestra todas las películas de Firebase en formato .json
- [POST] http://locahost:3000/api/peliculas -> Permite añadir películas
- [GET] http://locahost:3000/api/peliculas/<id> -> Muestra los detalles de esa película en concreto en formato .json
- [PUT] http://locahost:3000/api/peliculas/<id> -> Permite actualizar el nombre de la película que se muestra en http://locahost:3000/api/peliculas
- [DELETE] http://locahost:3000/api/peliculas/<id> -> Borrar la película


### Configuración en Firebase

Este script está pensado para utilizar un [Token](http://www.wikiwand.com/en/Access_token) en la escritura de datos en Firebase. La lectura de los datos no tiene restricciones. Es importante definir [las reglas de seguridad de firebase](https://www.firebase.com/docs/security/guide/securing-data.html) de una manera compatible.

```javascript
myFirebaseRef.authWithCustomToken(config.token, function(error, authData) {
    if (error) {
        logger.error("Error al guardar los datos en Firebase (relacionado con Token).", {
            datos: error
        });
    } else {
        logger.info("Autentificación (via Token) lograda con exito.", {
            datos: authData
        });
    }
});
```

Además se recomienda hacer un [indexado a la ruta "details/imbID"](https://www.firebase.com/docs/security/guide/indexing-data.html) que es la que se usa en el front para cargar los detalles de las películas.

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "nodemovies": {
      ".indexOn": ["details/imdbID"],
      ".read": true,
      ".write": "auth != null && auth.isAdmin == true"
    }
  }
}
```


### Configuración en Node

**Puerto e IP**

El script está listo para funcionar en [c9.io](https://c9.io/), si desea cambiarlo lo más sencillo es convertir *process.env.PORT* en *3000* u otro puerto y *process.env.IP* en *"localhost"*. Este ajuste solo es necesario en *server.js*

**Token y rutas**

Por defecto el repositorio incorpora un archivo *config.js* vacio. Es necesario meter los datos correspondientes para que funcione. Es recomendable que la propiedad *token* sea una variable del entorno, sobretodo en entornos de producción.

Este ajuste solo es necesario en los archivos *config.js* (rutas y token) 
```javascript
var config = {
  token: "",
  firebaseApp: "",
  firebaseAppRuta: ""
};
```
y *publico/js/index.js* (solo rutas)
```javascript
var myFBAdress = "";
var serverAdress = ""; // .../api/peliculas/
```


### Notas

El script descarga en *publico/img/* todos los posters de las películas. Y solo se utilizan esas imágenes o *black.jpg* en su defecto. Ya que la url original provoca un *error 503* al solicitarlas desde un dominio diferente (en localhost funcionan igualmente).

```javascript
// Guardar los posters (Método POST)
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
```
y elimina los posters cuando ya no son necesarios.
```javascript
// Elimina los posters (Método DELETE)
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
```
