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
const compare = require('resemblejs').compare;
const cypress = require('cypress');
const fs = require("mz/fs");
const uuidv4 = require('uuid/v4');
const compareImages = require('resemblejs/compareImages');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const HERRAMIENTA_CYPRESS = 1;
const NYGTHWATCH = 2;
const LIGHTHOUSE = 3;

const PRUEBA_SEQ = "seq_pruebas";
const REPORTE_SEQ = "seq_reportes";
const IMAGEN_SEQ = "seq_imagenes";
const COMPARACION_VISUAL_SEQ = "seq_comparaciones_visuales";

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var TiposPruebas = require('./models/tipospruebas'); 
var HerramientasPruebas    = require('./models/herramientaspruebas'); 
var Aplicaciones    = require('./models/aplicaciones'); 
var HerramientasAplicaciones = require('./models/herramientasaplicaciones');
var Pruebas    = require('./models/pruebas'); 
var Reportes    = require('./models/reportes'); 
var Imagenes 	= require('./models/imagenes'); 
var ComparacionesVisuales 	= require('./models/comparacionesvisuales'); 
var SeqPruebas    = require('./models/seqpruebas'); 
var SeqReportes    = require('./models/seqreportes');
var SeqImagenes    = require('./models/seqimagenes');
var SeqComparacionesVisuales = require('./models/seqcomparacionesvisuales');

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


router.route('/tipospruebas')
    .post(function(req, res) {
		var tipospruebas = new TiposPruebas();
		tipospruebas.idTipoPrueba = req.body.idTipoPrueba;
		tipospruebas.nombreTipoPrueba = req.body.nombreTipoPrueba;

        // save the tipo de pruebas and check for errors
        tipospruebas.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Tipo de pruebas creada!' });
		});
	})
	.get(function(req, res) {
        TiposPruebas.find(function(err, tipospruebas) {
            if (err)
                res.send(err);

	    	console.log('Este rest se esta ejecutando.' + tipospruebas); 	
            res.json(tipospruebas);
        });
    });			



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

router.route('/herramientaspruebas/tipospruebas/:idTipoPrueba')
.get(function(req, res) {
	HerramientasPruebas.find(
		// query
		{idTipoPrueba: req.params.idTipoPrueba},

		(err, herramientaspruebas) => {
		if (err) 
			return err;
		return  res.json(herramientaspruebas);
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

	router.route('/herramientasaplicaciones')
    .post(function(req, res) {
        var herramientaaplicacion = new HerramientasAplicaciones();      // create a new instance of the HerramientaAplicacion model
        herramientaaplicacion.idHerramienta = req.body.idHerramienta;
		herramientaaplicacion.idAplicacion = req.body.idAplicacion;
        // save the aplicacion and check for errors
        herramientaaplicacion.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'herramienta aplicacion creada!' });
        });

    })
	
	router.route('/aplicaciones/herramientaaplicacion/:idHerramienta')
	.get(function(req, res) {

		var herramientasAplicaciones = HerramientasAplicaciones.find(
			// query
			{idHerramienta: req.params.idHerramienta},
			(err, herramientaaplicacion) => {
			if (err) 
				return err;
			return  herramientaaplicacion;
		})
		.then((results) => {
			var arrayIdsAplicaciones = new Array();
			for(i=0;i<results.length;i++){
				arrayIdsAplicaciones[i] = results[i].idAplicacion;	
			}
			var aplicaciones = Aplicaciones.find(
				// query
				{idAplicacion: {$in: arrayIdsAplicaciones}},
				(err, aplicaciones) => {
					if (err) 
						res.send(err);
					return  res.json(aplicaciones);

			});
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
			var secuencia = results.sequenceValue + 1;
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
					return  seqPrueba;
				});	
			});
			var prueba = new Pruebas();      // create a new instance of the Pruebas model
			prueba.idPrueba = secuencia;  
			prueba.idHerramienta = req.body.idHerramienta;
			prueba.idAplicacion = req.body.idAplicacion;
			prueba.nombreArchivo = req.body.nombreArchivo;
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
			var secuencia = results.sequenceValue + 1;
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
								var nombreVideo = "Video_" + secuencia + "_prueba_" + req.body.idPrueba;
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
										var rutaVideo = "";
										var rutaImagenes = [];
										var secuenciaImagen;



										for(var i=0;i<=cypress.screenshots - 1;i++){
											var rutaScreenshot = herramienta.rutaScreenshots+nombreScreenshot+(i+1)+".png";
											var rutaImagen = herramienta.rutaImagenes+nombreScreenshot+(i+1)+".png";
											rutaImagenes[i] = rutaImagen;
											shell.cp(rutaScreenshot, herramienta.rutaImagenes);
										}

										if(cypress.video){
											rutaVideo = herramienta.rutaHttpVideos+nombreVideo+".mp4";
											shell.cp('-Rf', herramienta.rutaFisicaVideos+"*.mp4", rutaVideo);
										}
										
										i=1;
										rutaImagenes.forEach(function(rutaImagen, i){
											SeqImagenes.findOne(
											// query
												{sequenceName: IMAGEN_SEQ},
												// callback function
												(err, seqImagen) => {
													if (err) 
														return err;

													var secuenciaCambio = seqImagen.sequenceValue + i;
													console.log(secuenciaCambio);
													seqImagen.sequenceValue = secuenciaCambio;
													seqImagen.save(function (err, seqImagen) {
														if (err) 
															return err;	
														return  seqImagen;
														});	
													})
													.then((results) => {
														SeqImagenes.findOne(
															// query
															{sequenceName: IMAGEN_SEQ},
															// callback function
															(err, seqImagen) => {
																if (err) 
																	return err;
																return  seqImagen;
														})
														.then((results) => {
															var imagen = new Imagenes()
															imagen.idImagen = results.sequenceValue;
															imagen.urlImagen = rutaImagen;
															imagen.idReporte = secuencia;
															imagen.save(function(err) {
															if (err) 
																return err;				
															return  imagen;
															});
														});	
													});		
												i++;
										});	
										reporte.urlImagen = JSON.stringify(rutaImagenes);
										reporte.urlVideo = rutaVideo;
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

	router.route('/comparacionesvisuales')
		.post(function(req, res) {	
			SeqComparacionesVisuales.findOne(
				// query
				{sequenceName: COMPARACION_VISUAL_SEQ},
				// callback function
				(err, seqComparacionesVisuales) => {
					if (err) 
						return err;
					var secuenciaCambio = seqComparacionesVisuales.sequenceValue + 1;
					seqComparacionesVisuales.sequenceValue = secuenciaCambio;
					seqComparacionesVisuales.save(function (err, seqComparacionesVisuales) {
						if (err) 
							return err;	
						return  seqComparacionesVisuales;
						});	
					})
					.then((results) => {
						SeqComparacionesVisuales.findOne(
							// query
							{sequenceName: COMPARACION_VISUAL_SEQ},
							// callback function
							(err, seqComparacionesVisuales) => {
								if (err) 
									return err;
								return  seqComparacionesVisuales;
							})
							.then((results) => {
								var comparacionVisual = new ComparacionesVisuales();
								comparacionVisual.idComparacionVisual = results.sequenceValue;
								
								Imagenes.findOne(
									// query
									{idImagen: req.body.idImagen1},
						
									(err, imagen) => {
									if (err) 
										return err;
									return  imagen;
								})
								.then((results) => {
									var rutaImagen1 = results.urlImagen;
									Imagenes.findOne(
										// query
										{idImagen: req.body.idImagen2},
							
										(err, imagen) => {
										if (err) 
											return err;
										return  imagen;
									})
									.then((results) => {
										const options = {};
										var rutaImagen2 = results.urlImagen;
										console.log(rutaImagen1);
										console.log(rutaImagen2);
										compare(rutaImagen1, rutaImagen2, options, function (err, data) {
											if (err) {
												console.log('Ha ocurrido un error!' + err)
											} else {
												var rutaSalidaFisica = rutaImagenes + "resemblejs/salida.png";
												fs.writeFile(rutaSalidaFisica, data.getBuffer());
											}	
										});	
										comparacionVisual.idImagen1 = req.body.idImagen1;
										comparacionVisual.idImagen2 = req.body.idImagen2;
										comparacionVisual.save(function(err) {
											if (err) 
												res.send(err);			
											return  res.json({ message: 'Comparación visual creada!' });
										});									
									});	
								});	
							});	
					});	
		});	

	router.route('/reportes/:idReporte')
	.get(function(req, res) {
		Reportes.findOne(
			// query
			{idReporte: req.params.idReporte},

			(err, reporte) => {
			if (err) 
				res.send(err);
			return  res.json(reporte);
		});
    });

	router.route('/reportes/pruebas/:idPrueba')
	.get(function(req, res) {
		Reportes.find(
			// query
			{idPrueba: req.params.idPrueba},

			(err, reporte) => {
			if (err) 
				res.send(err);
			return  res.json(reporte);
		});
	});
	
	router.route('/imagenes/:idImagen')
	.get(function(req, res) {
		Imagenes.findOne(
			// query
			{idImagen: req.params.idImagen},

			(err, imagen) => {
			if (err) 
				res.send(err);
			return  res.json(imagen);
		});
    });	

	router.route('/imagenes/reportes/:idReporte')
	.get(function(req, res) {
		Imagenes.find(
			// query
			{idReporte: req.params.idReporte},

			(err, imagenes) => {
			if (err) 
				return res.send(err);
			return  res.json(imagenes);
		});
    });

	router.route('/comparacionesvisuales/:idImagen1/:idImagen2')
	.get(function(req, res) {
		ComparacionesVisuales.find(
			// query
			{idImagen1: req.params.idImagen1, idImagen2: req.params.idImagen2},

			(err, comparacionVisual) => {
			if (err) 
				return res.send(err);
			return  res.json(comparacionVisual);
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
	
router.route('/seqimagenes')
    .post(function(req, res) {
        var seqImagen = new SeqImagenes();      // create a new instance of the seqimagenes model
        seqImagen.sequenceValue = req.body.sequenceValue;
		seqImagen.sequenceName = req.body.sequenceName;
        // save the sequenceImagen and check for errors
        seqImagen.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'secuencia de imagen creada!' });
        });
    });

router.route('/seqcomparacionesvisuales')
    .post(function(req, res) {
        var seqcomparacionesvisuales = new SeqComparacionesVisuales();      // create a new instance of the seqimagenes model
        seqcomparacionesvisuales.sequenceValue = req.body.sequenceValue;
		seqcomparacionesvisuales.sequenceName = req.body.sequenceName;
        // save the sequenceImagen and check for errors
        seqcomparacionesvisuales.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'secuencia de comparación creada!' });
        });
    });	

// more routes for our API will happen here
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);
app.use('/api', router);
app.use('/public', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/node_modules'));


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Su servidor esta corriendo por el puerto ' + port);
