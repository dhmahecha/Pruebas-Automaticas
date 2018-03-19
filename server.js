// server.js

// BASE SETUP
// =============================================================================

var mongoose   = require('mongoose');
mongoose.connect(process.env.CONEXION_MONGO_TOOL); 

// call the packages we need
var exec = require('child_process').exec, child;
var Reportes    = require('./models/reportes');       
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var shell = require('shelljs');
const cypress = require('cypress');
const fs = require("mz/fs");
const compare = require('resemblejs').compare;
const uuidv4 = require('uuid/v4');
const compareImages = require('resemblejs/compareImages');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const HERRAMIENTA_CYPRESS = 1;
const NYGTHWATCH = 2;
const LIGHTHOUSE = 3;

const PRUEBA_SEQ = "seq_pruebas";
const REPORTE_SEQ = "seq_reportes";

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var HerramientasPruebas    = require('./models/herramientaspruebas'); 
var Aplicaciones    = require('./models/aplicaciones'); 
var Pruebas    = require('./models/pruebas'); 
var Reportes    = require('./models/reportes'); 
var SeqPruebas    = require('./models/seqpruebas'); 
var SeqReportes    = require('./models/seqreportes'); 

const ruta_screenshots = 'cypress/screenshots/';
const ruta_http_screenshots = 'static/imagenes/';
const rutaImagenes = 'public/imagenes/';


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


function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
  return chromeLauncher.launch(flags).then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results));
  });
}

const flags = {
  chromeFlags: ['--headless']
};


router.route('/herramientaspruebas')
    .post(function(req, res) {
        var herramientaprueba = new HerramientasPruebas();      // create a new instance of the HerramientasPruebas model
        herramientaprueba.idHerramienta = req.body.idHerramienta;
		herramientaprueba.nombreHerramienta = req.body.nombreHerramienta;
		herramientaprueba.rutaReportes = req.body.rutaReportes;
		herramientaprueba.rutaHttpVideos = req.body.rutaHttpVideos;	
		herramientaprueba.rutaFisicaVideos = req.body.rutaFisicaVideos;		
		herramientaprueba.rutaImagenes = req.body.rutaImagenes;
		herramientaprueba.rutaScreenhots = req.body.rutaScreenhots;		
		herramientaprueba.rutaLogs = req.body.rutaLogs;
		herramientaprueba.comandoEjecucion = req.body.comandoEjecucion;

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


router.route('/aplicaciones')
    .post(function(req, res) {
        var aplicacion = new Aplicaciones();      // create a new instance of the Aplicaciones model
        aplicacion.idAplicacion = req.body.idAplicacion;  
		aplicacion.nombreAplicacion = req.body.nombreAplicacion;
		aplicacion.urlAplicacion = req.body.urlAplicacion;
        // save the aplicacion and check for errors
        aplicacion.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'aplicacion creada!' });
        });

    })
   .get(function(req, res) {
        Aplicaciones.find(function(err, aplicaciones) {
            if (err)
                res.send(err);

	    	console.log('Este rest se esta ejecutando.' + aplicaciones); 	
            res.json(aplicaciones);
        });
    });

router.route('/pruebas')		
    .post(function(req, res) {
		SeqPruebas.findOne(
			// query
			{sequenceName: PRUEBA_SEQ},
			// callback function
			(err, seqPrueba) => {
			if (err) 
				return err;
			return  seqPrueba;
		})
		.then((results) => {
			secuencia = results.sequenceValue + 1;
			SeqPruebas.findOne(
				// query
				{sequenceName: PRUEBA_SEQ},
				// callback function
				(err, seqPrueba) => {
				if (err) 
					return err;
					
				seqPrueba.sequenceValue = secuencia;
				seqPrueba.save(function (err, seqPrueba) {
					if (err) 
						return err;	
					console.log("despues " + seqPrueba.sequenceValue);				
					return  seqPrueba;
				});	
			});
			var prueba = new Pruebas();      // create a new instance of the Pruebas model
			prueba.idPrueba = secuencia;  
			prueba.idHerramienta = req.body.idHerramienta;
			prueba.idAplicacion = req.body.idAplicacion;
			prueba.rutaArchivo = req.body.rutaArchivo;
			// save the prueba and check for errors
			prueba.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Prueba creada!' });
			});	
		});			
    })
    .get(function(req, res) {
        Pruebas.find(function(err, pruebas) {
            if (err)
                res.send(err);
            res.json(pruebas);
        });
    });

router.route('/reportes')
    .post(function(req, res) {

		SeqReportes.findOne(
			// query
			{sequenceName: REPORTE_SEQ},
			// callback function
			(err, seqReporte) => {
			if (err) 
				return err;
			return  seqReporte;
		})
		.then((results) => {
			secuencia = results.sequenceValue + 1;
			SeqReportes.findOne(
				// query
				{sequenceName: REPORTE_SEQ},
				// callback function
				(err, seqReporte) => {
				if (err) 
					return err;
					
				seqReporte.sequenceValue = secuencia;
				seqReporte.save(function (err, seqReporte) {
					if (err) 
						return err;				
					return  seqReporte;
				});	
			});	
			var reporte = new Reportes(); // create a new instance of the Reportes model
			Pruebas.findOne(
				// query
				{idPrueba: req.body.idPrueba},
				// callback function
				(err, prueba) => {
					if (err) 
						return err;
					return  prueba;
			})
			.then((results) => {
				var prueba = results;

				Aplicaciones.findOne(
					// query
					{idAplicacion: prueba.idAplicacion},
					// callback function
					(err, aplicacion) => {
						if (err) 
							return err;
						return  aplicacion;
					})
					.then((results) => {
						var aplicacion = results;
						HerramientasPruebas.findOne(
							// query
							{idHerramienta: prueba.idHerramienta},
							// callback function
							(err, herramienta) => {
								if (err) 
									return err;
								return  herramienta;
							})
							.then((results) => {
								var herramienta = results;
								var nombreScreenshot = "Reporte_" + secuencia + "_prueba_" + req.body.idPrueba + "_";
								reporte.idReporte = secuencia;
								reporte.idPrueba = req.body.idPrueba;
								var rutaConfiguracionArchivo = herramienta.rutaConfiguracion + prueba.nombreArchivo;
								if(prueba.idHerramienta == HERRAMIENTA_CYPRESS){
									cypress.run({
										spec: rutaConfiguracionArchivo,
										env:{
											urlAplicacion: aplicacion.urlAplicacion,
											nombreAplicacion: aplicacion.nombreAplicacion,
											screen: nombreScreenshot,
										}
									})
									.then((results) => {
										var cypress = results;
										var rutaImagenes = [];
										for(var i=0;i<=cypress.screenshots - 1;i++){
											var rutaScreenshot = herramienta.rutaScreenshots+nombreScreenshot+(i+1)+".png";
											var rutaImagen = herramienta.rutaImagenes+nombreScreenshot+(i+1)+".png";
											rutaImagenes[i] = rutaImagen;
											shell.cp(rutaScreenshot, herramienta.rutaImagenes);
										}

										if(cypress.video){
											//shell.cp(herramienta.rutaFisicaVideos+"/");

										}

										reporte.urlImagen = JSON.stringify(rutaImagenes);
										reporte.urlVideo = req.body.urlVideo;
										reporte.urlLog = req.body.urlLog;	
										reporte.informacion = JSON.stringify(cypress);
										reporte.save(function(err) {
										if (err)
											res.send(err);
										res.json({ message: 'reporte creado!' });
										});										
										// save the reporte and check for errors
									});
								}
								else if(prueba.idHerramienta == HERRAMIENTA_CYPRESS){


								}
								else if(prueba.idHerramienta == LIGHTHOUSE){
									/*launchChromeAndRunLighthouse(aplicacion.urlAplicacion, flags).then(results => {
										console.log("--------> Entra");
  									// Use results!
									});*/

									var comando = herramienta.comandoEjecucion  + rutaConfiguracionArchivo + " " + aplicacion.urlAplicacion;
									var nombreReporte = "Reporte_" + secuencia + "_prueba_" + req.body.idPrueba + ".html";
									console.log(comando + " --output-path " + herramienta.rutaReportes + nombreReporte);
									shell.exec(comando + " --output-path " + herramienta.rutaReportes + nombreReporte) + " -output html";
									reporte.urlReporte = herramienta.rutaReportes + nombreReporte;
									reporte.save(function(err) {
									if (err)
										res.send(err);
									res.json({ message: 'reporte creado!' });
									});									
								}
							});	
					});				
			});
    	});
	})	
    .get(function(req, res) {
        Reportes.find(function(err, reportes) {
            if (err)
                res.send(err);
            res.json(reportes);
        });
    });

router.route('/seqpruebas')
    .post(function(req, res) {
        var seqPrueba = new SeqPruebas();      // create a new instance of the Reportes model
        seqPrueba.sequenceValue = req.body.sequenceValue  
		seqPrueba.sequenceName = req.body.sequenceName;
        // save the reporte and check for errors
        seqPrueba.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'secuencia de prueba creada!' });
        });
    });	

router.route('/seqreportes')
    .post(function(req, res) {
        var seqReporte = new SeqReportes();      // create a new instance of the Reportes model
        seqReporte.sequenceValue = req.body.sequenceValue;
		seqReporte.sequenceName = req.body.sequenceName;
        // save the reporte and check for errors
        seqReporte.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'secuencia de reporte creada!' });
        });
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
