// server.js

// BASE SETUP
// =============================================================================

console.log(process.env.CONEXION_MONGO_TOOL);
var mongoose   = require('mongoose');
mongoose.connect(process.env.CONEXION_MONGO_TOOL); 

// call the packages we need
var exec = require('child_process').exec, child;
var Reportes    = require('./models/reportes');
var HerramientasPruebas    = require('./models/herramientaspruebas');        
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var shell = require('shelljs');
const cypress = require('cypress');
const fs = require("mz/fs");
const compare = require('resemblejs').compare;
const uuidv4 = require('uuid/v4');
const compareImages = require('resemblejs/compareImages');

const ruta_screenshots = 'cypress/screenshots/';
const ruta_http_screenshots = 'static/imagenes/';
const rutaImagenes = 'public/imagenes/';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');	
    //res.json({ message: 'Bienvenido al api rest' });   
});

router.get('/api', function(req, res) {
    res.json({ message: 'Bienvenido al api rest' });   
});

router.route('/herramientaspruebas')

    .post(function(req, res) {
        var herramientaprueba = new HerramientasPruebas();      // create a new instance of the HerramientasPruebas model
        herramientaprueba.NOMBRE = req.body.nombre;
		herramientaprueba.RUTA_EJECUTABLE = req.body.rutaEjecutable;
		herramientaprueba.RUTA_LOGS = req.body.rutaLogs;
		herramientaprueba.COMANDO_EJECUCION = req.body.comandoEjecucion;
        // save the herramienta de pruebas and check for errors
        herramientaprueba.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Herramienta de pruebas creada!' });
        });

    })

   .get(function(req, res) {
        HerramientasPruebas.find(function(err, herramientaspruebas) {
            if (err)
                res.send(err);

	    	console.log('Este rest se esta ejecutando.' + herramientaspruebas); 	
            res.json(herramientaspruebas);
        });
    });


router.route('/reportes')

		
    .post(function(req, res) {

        var reporte = new Reportes();      // create a new instance of the Reportes model
        reporte.ruta_img_base = req.body.ruta_img_base;  
		reporte.ruta_img_modificada = req.body.ruta_img_modificada;
        // save the bear and check for errors
        reporte.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'reporte creado!' });
        });

    })

    .get(function(req, res) {
        Reportes.find(function(err, reportes) {
            if (err)
                res.send(err);
            res.json(reportes);
        });
    });


router.route('/ejecutar')
    .post(function(req, res) {

        var reporte = new Reportes();      // create a new instance of the Reportes model
        reporte.ruta_img_base = req.body.ruta_img_base;  
		reporte.ruta_img_modificada = req.body.ruta_img_modificada;
        // save the bear and check for errors
        reporte.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'reporte creado!' });
        });

    })




    .get(function(req, res) {

	var nombreArchivo = uuidv4();

	var rutaCypressArchivo1 = ruta_screenshots + nombreArchivo+"1.png";
	var rutaCypressArchivo2 = ruta_screenshots + nombreArchivo+"2.png";
	var rutaSalidaFisica = 'public/comparacion/' + nombreArchivo + "-salida.png";
	var rutaSalidaHttp = 'static/comparacion/' + nombreArchivo + "-salida.png";	
	var rutaImagenesArchivo1 = rutaImagenes + nombreArchivo+"1.png";
	var rutaImagenesArchivo2 = rutaImagenes + nombreArchivo+"2.png";
	var rutaHttpArchivo1 = ruta_http_screenshots + nombreArchivo+"1.png";
	var rutaHttpArchivo2 = ruta_http_screenshots + nombreArchivo+"2.png";

	var informacionImportante;

	cypress.run({
		spec: './cypress/integration/simple_spec.js',
		env:{
			screen: nombreArchivo,
		}
	}
	)
	.then((results) => {
		console.log(results)
		const options = {};
		
		shell.cp(rutaCypressArchivo1, rutaImagenes);
		shell.cp(rutaCypressArchivo2, rutaImagenes);
	
		compare(rutaCypressArchivo1, rutaCypressArchivo2, options, function (err, data) {
		if (err) {
			console.log('An error!' + err)
		} else {
			console.log(data);
			fs.writeFile(rutaSalidaFisica, data.getBuffer());

			informacionImportante = 
				"<b>Tiene las mismas dimensiones:</b> " + data.isSameDimensions + "<br>" +
				"<b>Diferencia de dimensiones:</b> " + "<b>width:</b> " +  data.dimensionDifference.width +", <b>height:</b> " + 									data.dimensionDifference.height + "<br>" +
				"<b>Porcentaje de coincidencia erronea:</b> " + data.rawMisMatchPercentage + "<br>" + 
				"<b>Límites de diferencia:</b> " + "<b>top:</b> " + data.diffBounds.top + ", <b>left:</b> " + data.diffBounds.left + ", 									<b>bottom:</b> " + data.diffBounds.bottom + ", <b>right:</b> " + data.diffBounds.right  +"<br>" + 
				"<b>Analisis de tiempo:</b> " +  data.analysisTime;

		 	var reporte = new Reportes();      // create a new instance of the Reportes model
			reporte.ruta_img_base =   rutaHttpArchivo1;
			reporte.ruta_img_modificada = rutaHttpArchivo2;
			reporte.ruta_img_salida = rutaSalidaHttp;
			reporte.informacion = informacionImportante;
			// save the bear and check for errors
			reporte.save(function(err) {
			    if (err)
				res.send(err);
			});
			console.log(informacionImportante);
		}
		});


	})
	.catch((err)=>{console.error(err)})




	res.json("OK");
    });

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);
app.use('/api', router);
app.use('/static', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/node_modules'));
app.use('/static', express.static(__dirname + '/cypress'));


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Su servidor esta corriendo por el puerto ' + port);
