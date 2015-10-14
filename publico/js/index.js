/*global Firebase*/

var myFBAdress = "<<<--- FIREBASE-URL --->>>";
var favMovies = new Firebase(myFBAdress);
var serverAdress = "<<<--- URL --->>>/api/peliculas/";

function saveToList(event) {
    if (event.which == 13 || event.keyCode == 13) {
        var movieName = document.getElementById('movieName').value.trim();
        if (movieName.length > 0) {
            llamarAPI("POST", "", movieName);
        }
        document.getElementById('movieName').value = '';
        return false;
    }
}

function refreshUI(list) {
    var lis = '';
    for (var i = 0; i < list.length; i++) {
        lis += '<div class="panel panel-default"><div class="panel-body" data-key="' + list[i].key + '"><strong>' + list[i].name; + '</strong>';
        lis += '<span class="pull-right">' + genLinks(list[i].key, list[i].name) + '</span></div></div>';
    }
    document.getElementById('favMovies').innerHTML = lis;
    $('#detallesModal').hide();
}

function genLinks(key, mvName) {
    var links = '';

    links += '<div class="btn-group">';
    links += '<a type="button" class="botones btn btn-default" href="javascript:details(\'' + key + '\',\'' + mvName + '\')"><span class="glyphicon glyphicon-info-sign"></span></a>';
    links += '<a type="button" class="botones btn btn-default" href="javascript:edit(\'' + key + '\',\'' + mvName + '\')"><span class="glyphicon glyphicon-pencil"></span></a>';
    links += '<a type="button" class="botones btn btn-default" href="javascript:del(\'' + key + '\',\'' + mvName + '\')"><span class="glyphicon glyphicon-remove"></span></a>';
    links += '</div>';

    return links;
}

function details(key, mvName) {
    favMovies.on("value", function(snapshot) {
        var data = snapshot.val();
        var imgDetails = '<img class="img-responsive imgPoster" src="img/black.jpg">';

        if (data[key].details.posterSolution) {
            imgDetails = '<img class="img-responsive imgPoster" src="img/' + data[key].details.posterSolution + '">';
        }
        var allDetails = '<p><strong>ID:</strong> ' + data[key].details.imdbID + '</p>';

        // Verificando el director
        if (data[key].details.director) {
            allDetails += '<p><strong>Director:</strong> ' + data[key].details.director + '</p>';
        }

        // Verificando el año
        if (data[key].details.year) {
            allDetails += '<p><strong>Year:</strong> ' + data[key].details.year + '</p>';
        }

        // Dividiendo y agrupando actores
        if (data[key].details.actors) {
            if (data[key].details.actors.length == 1 && data[key].details.actors.length != 0) {
                allDetails += '<p><strong>Actors:</strong> ' + data[key].details.actors[0] + '</p>';
            } else {
                allDetails += '<p><strong>Actors:</strong> ' + data[key].details.actors[0];
                for (var i = 1; i < data[key].details.actors.length; i++) {
                    allDetails += ', ' + data[key].details.actors[i];
                }
                allDetails += '</p>';
            }
        }

        // Dividiendo y agrupando generos
        if (data[key].details.genres) {
            if (data[key].details.genres.length == 1 && data[key].details.genres.length != 0) {
                allDetails += '<p><strong>Genres:</strong> ' + data[key].details.genres[0] + '</p>';
            } else {
                allDetails += '<p><strong>Genres:</strong> ' + data[key].details.genres[0];
                for (var i = 1; i < data[key].details.genres.length; i++) {
                    allDetails += ', ' + data[key].details.genres[i];
                }
                allDetails += '</p>';
            }
        }

        // Dividiendo y agrupando paises
        if (data[key].details.countries) {
            if (data[key].details.countries.length == 1 && data[key].details.countries.length != 0) {
                allDetails += '<p><strong>Countries:</strong> ' + data[key].details.countries[0] + '</p>';
            } else {
                allDetails += '<p><strong>Countries:</strong> ' + data[key].details.countries[0];
                for (var i = 1; i < data[key].details.countries.length; i++) {
                    allDetails += ', ' + data[key].details.countries[i];
                }
                allDetails += '</p>';
            }
        }

        // Dividiendo y agrupando la descripción
        if (data[key].details.plot) {
            if (data[key].details.plot.length >= 250) {
                allDetails += '<p><strong>Plot:</strong> ' + data[key].details.plot.substring(0, 250) + '<a href="http://www.imdb.com/title/' + data[key].details.imdbID + '" target="_blank"><span>...</span></a> </p>';
            } else {
                allDetails += '<p><strong>Plot:</strong> ' + data[key].details.plot + '</p>';
            }
        }

        $('#detallesModalLabel').html(data[key].details.title);
        $('#imagenDetalles').html(imgDetails);
        $('#textoDetalles').html(allDetails);
        $('#detallesModal').modal('show')
    });
}

function edit(key, mvName) {
    var movieName = prompt("Update the movie name", mvName);
    if (movieName && movieName.length > 0) {
        llamarAPI("PUT", key, movieName);
    }
}

function del(key, mvName) {
    var response = confirm("Are certain about removing \"" + mvName + "\" from the list?");
    if (response === true) {
        llamarAPI("DELETE", key);
    }
}

function llamarAPI(tipo, ruta, datos) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": serverAdress + ruta || "",
        "method": tipo,
        "headers": {
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded"
        },
        "data": {
            "nombre": datos || ""
        }
    };
    $.ajax(settings).done(function(response) {
        $('#detallesModal').hide();
    });
}

favMovies.on("value", function(snapshot) {
    var data = snapshot.val();
    var list = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var name = data[key].name ? data[key].name : '';
            if (name.trim().length > 0) {
                list.push({
                    name: name,
                    key: key
                });
            }
        }
    }
    refreshUI(list);
});