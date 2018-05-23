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
var async = require('async');
const cypress = require('cypress');
const fs = require("mz/fs");
const uuidv4 = require('uuid/v4');
const compareImages = require('resemblejs/compareImages');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const HERRAMIENTA_CYPRESS = 1;
const NYGTHWATCH = 2;
const LIGHTHOUSE = 3;
const MUTODE = 4;

const PRUEBA_SEQ = "seq_pruebas";
const REPORTE_SEQ = "seq_reportes";
const IMAGEN_SEQ = "seq_imagenes";
const COMPARACION_VISUAL_SEQ = "seq_comparaciones_visuales";
const APLICACION_SEQ = "seq_aplicaciones";
const HERRAMIENTA_APLICACION_SEQ = "seq_herramientas_aplicaciones";

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
var SeqHerramientasAplicaciones = require('./models/seqherramientasaplicaciones');
var SeqAplicaciones = require('./models/seqaplicaciones');

const rutaImagenes = 'public/imagenes/';
const ESTADO_EN_PROCESO = 1;


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
		herramientaprueba.rutaConfiguracion = req.body.rutaConfiguracion;		

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
		SeqAplicaciones.findOneAndUpdate(
			{sequenceName: APLICACION_SEQ},
			{ "$inc": { "sequenceValue": 1 } },
			function(err,seqPrueba) {
				if (err) 
					return err;
		
			}
		)
		.then((results) => {
			var aplicacion = new Aplicaciones();      // create a new instance of the Aplicaciones model
			var secuenciaAplicacion = results.sequenceValue;
			aplicacion.idAplicacion = secuenciaAplicacion;
			aplicacion.nombreAplicacion = req.body.nombreAplicacion;
			aplicacion.urlAplicacion = req.body.urlAplicacion;
			// save the aplicacion and check for errors
			aplicacion.save()
			.then((results) => {
				SeqHerramientasAplicaciones.findOneAndUpdate(
					{sequenceName: HERRAMIENTA_APLICACION_SEQ},
					{ "$inc": { "sequenceValue": 1 } },
					function(err,seqPrueba) {
						if (err) 
							return err;
					}
				)
				.then((results) => {
					var herramientaAplicacion = new HerramientasAplicaciones();
					herramientaAplicacion.idHerramientaAplicacion = results.sequenceValue;
					herramientaAplicacion.idHerramienta = req.body.idHerramienta;
					herramientaAplicacion.idAplicacion = secuenciaAplicacion;
					herramientaAplicacion.save(
						function(err) {
							if (err)
								res.send(err);
				
							res.json({ message: 'Aplicación creada!' });
						}
					);
				});
			});
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


	router.route('/aplicaciones/:idAplicacion')
	.get(function(req, res) {
        Aplicaciones.find(
			// query
			{idAplicacion: req.params.idAplicacion},

			(err, aplicacion) => {
				if (err) 
					return res.send(err);
				return  res.json(aplicacion);
			});
    });


	router.route('/aplicaciones/herramientasaplicaciones/:idHerramientaAplicacion')
	.get(function(req, res) {
		HerramientasAplicaciones.findOne(
			// query
			{idHerramientaAplicacion: req.params.idHerramientaAplicacion},

			(err, herramientaaplicacion) => {
				if (err) 
					return err;
				return  herramientaaplicacion;
		})
		.then((results) => {
			var herramientaaplicacion = results;
			Aplicaciones.findOne(
				// query
				{idAplicacion: herramientaaplicacion.idAplicacion},
	
				(err, aplicacion) => {
					console.log(aplicacion);
					if (err) 
						return res.send(err);
					return  res.json(aplicacion);
			});
		});	
    });


	router.route('/herramientaspruebas/herramientasaplicaciones/:idHerramientaAplicacion')
	.get(function(req, res) {
		HerramientasAplicaciones.findOne(
			// query
			{idHerramientaAplicacion: req.params.idHerramientaAplicacion},

			(err, herramientaaplicacion) => {
				if (err) 
					return err;
				return  herramientaaplicacion;
		})
		.then((results) => {
			var herramientaaplicacion = results;
			HerramientasPruebas.findOne(
				// query
				{idHerramienta: herramientaaplicacion.idHerramienta},
	
				(err, aplicacion) => {
					console.log(aplicacion);
					if (err) 
						return res.send(err);
					return  res.json(aplicacion);
			});
		});	
    });	

	router.route('/herramientasaplicaciones')
    .post(function(req, res) {
        var herramientaaplicacion = new HerramientasAplicaciones();      // create a new instance of the HerramientaAplicacion model
		herramientaaplicacion.idHerramientaAplicacion = req.body.idHerramientaAplicacion;
		herramientaaplicacion.idHerramienta = req.body.idHerramienta;
		herramientaaplicacion.idAplicacion = req.body.idAplicacion;
        // save the aplicacion and check for errors
        herramientaaplicacion.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'herramienta aplicacion creada!' });
        });

	})
	
	router.route('/herramientasaplicaciones/:idHerramienta/:idAplicacion')
    .get(function(req, res) {
		var herramientasAplicaciones = HerramientasAplicaciones.findOne(
			// query
			{idHerramienta: req.params.idHerramienta, idAplicacion: req.params.idAplicacion},
			(err, herramientaaplicacion) => {
			if (err) 
				res.send(err);
			return  res.json(herramientaaplicacion);
		})
	});
	
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
		SeqPruebas.findOneAndUpdate(
			{sequenceName: PRUEBA_SEQ},
			{ "$inc": { "sequenceValue": 1 } },
			function(err,seqPrueba) {
				if (err) 
					return err;
		
			}
		).then((results) => {
			secuencia = results.sequenceValue;
			Pruebas.findOne(
				// query
				{idHerramienta: req.params.idHerramienta, idAplicacion: req.params.idAplicacion},
				// callback function
				(err, prueba) => {
					if (err) 
						return err;
					return  prueba;
			}).then((results) => {		
				var prueba = new Pruebas();      // create a new instance of the Pruebas model
				prueba.idPrueba = secuencia;  
				prueba.idHerramientaAplicacion = results.idHerramientaAplicacion
				prueba.nombreArchivo = req.body.nombreArchivo;
				// save the prueba and check for errors
				prueba.save(function(err) {
					if (err)
						res.send(err);

					res.json({ message: 'Prueba creada!' });
				});
			});	
		});		
    })
    .get(function(req, res) {
		Pruebas.find().sort({'idPrueba':-1}).exec(function(err, pruebas) {
            if (err)
                res.send(err);
            res.json(pruebas);
        });
	});


function consultarUltimaImagenReporte(idReporte){
	return Imagenes.aggregate([
		{$match:{idReporte:idReporte}},
		{$group: {_id:null,max:{$max:"$idImagen"}}}
	]);
}	

router.route('/reportes')
    .post(function(req, res) {
		
		SeqReportes.findOneAndUpdate(
			{sequenceName: REPORTE_SEQ},
			{ "$inc": { "sequenceValue": 1 } },
			function(err,seqReporte) {
				if (err) 
					return err;
		
			}
		).then((results) => {
			var idReporte = results.sequenceValue;
			var reporte = new Reportes(); // create a new instance of the Reportes model
			reporte.idReporte = idReporte;
			reporte.idPrueba = req.body.idPrueba;
			reporte.indEstado = ESTADO_EN_PROCESO;
			reporte.save(function(err) {
				if (err) 
					res.send(err);			
				return  res.json({ message: 'Reporte en proceso:' +  reporte.idReporte});
			});		
    	});
	})	
    .get(function(req, res) {
        Reportes.find().sort({'idReporte':-1}).exec(function(err, reportes) {
            if (err)
                res.send(err);
            res.json(reportes);
        });
	});

	
	
	router.route('/comparacionesvisuales/reportes/:idPrueba')
	.get(function(req, res) {
		Reportes.find(
			// query
			{idPrueba: req.params.idPrueba},

			(err, reportes) => {
			if (err) 
				err;
			return reportes;
		})
		.then((results) => {
			var arrayIdsReportes = new Array();
			for(i=0;i<results.length;i++){
				arrayIdsReportes[i] = results[i].idReporte;	
			}
			var imagenes = Imagenes.find(
				// query
				{idReporte: {$in: arrayIdsReportes}},
				(err, imagenes) => {
					if (err) 
						err;
					return  imagenes;
			})
			.then((results) => {
				var arrayIdsImagenes = new Array();
				for(i=0;i<results.length;i++){
					arrayIdsImagenes[i] = results[i].idImagen;	
				}
				var comparacionesvisuales = ComparacionesVisuales.find({
						$or:[
						{
							idImagen1: {$in: arrayIdsImagenes}
						}, 
						{
							idImagen2: {$in: arrayIdsImagenes}
						}]
					},
					(err, comparacionesvisuales) => {
						if (err) 
							res.send(err);
						return  res.json(comparacionesvisuales);
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

	router.route('/seqaplicaciones')
    .post(function(req, res) {
        var seqaplicaciones = new SeqAplicaciones();      // create a new instance of the seqimagenes model
        seqaplicaciones.sequenceValue = req.body.sequenceValue;
		seqaplicaciones.sequenceName = req.body.sequenceName;
        // save the sequenceImagen and check for errors
        seqaplicaciones.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'secuencia de aplicaciones creada!' });
        });
	});	
	
	router.route('/seqherramientasaplicaciones')
    .post(function(req, res) {
        var seqherramientasaplicaciones = new SeqHerramientasAplicaciones();      // create a new instance of the seqimagenes model
        seqherramientasaplicaciones.sequenceValue = req.body.sequenceValue;
		seqherramientasaplicaciones.sequenceName = req.body.sequenceName;
        // save the sequenceImagen and check for errors
        seqherramientasaplicaciones.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'secuencia de Herramieta aplicación creada!' });
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