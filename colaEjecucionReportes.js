var kue = require('kue-scheduler');
var Queue = kue.createQueue();
const mongoist = require('mongoist');
const db = mongoist(process.env.CONEXION_MONGO_TOOL);
const cypress = require('cypress');
var shell = require('shelljs');
const fs = require("mz/fs");
const compare = require('resemblejs').compare;

const HERRAMIENTA_CYPRESS = 1;
const CYPRESS_MONKEYS = 2;
const LIGHTHOUSE = 3;
const MUTODE = 4;


const ESTADO_EN_PROCESO = 1;
const ESTADO_PROCESADO = 2;

const IMAGEN_SEQ = "seq_imagenes";
const COMPARACION_VISUAL_SEQ = "seq_comparaciones_visuales";

const rutaImagenes = 'public/imagenes/';

var jobName = "sendReport";

// Create a job instance in the queue.
var job = Queue
            .createJob(jobName)
            .priority('normal')
            .removeOnComplete(true);

// Schedule it to run every 60 minutes. Function every(interval, job) accepts interval in either a human-interval String format or a cron String format.
Queue.every('10 seconds', job);

Queue.process(jobName, sendReport);

async function sendReport(job, done) {

const coleccionReportes = await db.reportes.find({indEstado:ESTADO_EN_PROCESO});
coleccionReportes.forEach(reporte => {
    consultarUltimaImagenPrueba(reporte.idPrueba)
        .then((results) => {
            imagenesAnteriores = results;       
            actualizarEstadoReporte(reporte.idReporte)
            .then((results) => {
                var reporte = results;
                getPrueba(reporte.idPrueba)
                .then((results) => {
                    var prueba = results;
                    getHerramientaAplicacion(prueba.idHerramientaAplicacion)
                    .then((results) => {
                        var heramientaaplicacion = results;
                        getHerramietaPrueba(heramientaaplicacion.idHerramienta)
                        .then((results) => {
                            var herramienta = results;
                            getAplicacion(heramientaaplicacion.idAplicacion)
                            .then((results) => {
                                var aplicacion = results;

                                var nombreScreenshot = "Imagen_reporte_" + reporte.idReporte + "_prueba_" + prueba.idPrueba + "_";
                                var nombreVideo = "Video_reporte" + reporte.idReporte + "_prueba_" + prueba.idPrueba;
                                var rutaConfiguracionArchivo = herramienta.rutaConfiguracion + "monkey_testing_ripper.spec.js";

                                console.log(heramientaaplicacion.idHerramienta);
                                if(heramientaaplicacion.idHerramienta == CYPRESS_MONKEYS){
                                    console.log("Enviando Prueba de monkeys");         
                                }
                                else{
                                    rutaConfiguracionArchivo = herramienta.rutaConfiguracion + prueba.nombreArchivo;
                                }

                                if(heramientaaplicacion.idHerramienta == HERRAMIENTA_CYPRESS || heramientaaplicacion.idHerramienta == CYPRESS_MONKEYS){
                                    console.log("Se lanzará cypress");
                                    lanzarCypress(nombreScreenshot, nombreVideo, rutaConfiguracionArchivo, reporte, aplicacion, herramienta, imagenesAnteriores);
                                }
                                else if(heramientaaplicacion.idHerramienta == LIGHTHOUSE){
                                    lanzarLighthouse(herramienta,aplicacion,prueba,reporte,rutaConfiguracionArchivo);
                                }  
                            });    
                        }); 
                    });    
                });
            }); 
        });
    });  
    done();
}


 function getPrueba(idPrueba){
    return db.pruebas.findOne({idPrueba:idPrueba});
}

function getHerramientaAplicacion(idHerramientaAplicacion){
    return db.herramientasaplicaciones.findOne({idHerramientaAplicacion:idHerramientaAplicacion});
}

function getAplicacion(idAplicacion){
    return db.aplicaciones.findOne({idAplicacion:idAplicacion});
}

function getHerramietaPrueba(idHerramienta){
    return db.herramientaspruebas.findOne({idHerramienta:idHerramienta});
}

function getMaxReportePrueba(idPrueba){
    return db.reportes.findOne({idPrueba:idPrueba, indEstado: ESTADO_PROCESADO});
}

function getImagenes(idImagen){
    return db.imagenes.findAsCursor().sort({'idImagen':-1}).toArray();;
}

function getImagenesReporte(idReporte){
    return db.imagenes.findAsCursor({idReporte:idReporte}).sort({'idImagen':-1}).toArray();;
}

function getMaxImagenReporte(idReporte){
    return db.imagenes.aggregate([
        {$match:{idReporte:idReporte}},
        {$group: {_id:null,max:{$max:"$idImagen"}}}
    ]) 
}

function actualizarEstadoReporte(idReporte){
    return db.reportes.findAndModify({
        query: { idReporte: idReporte },
        update: { $set: { indEstado: 2 } },
        new: true
      });
}

function actualizarReporteCypress(idReporte, rutaVideo, cypress){
    console.log("Actualizando reporte");
    return db.reportes.update({
        idReporte: idReporte}, {$set: {urlVideo: rutaVideo, informacion: JSON.stringify(cypress), fechaProcesamiento: Date.now}}, {multi: true}
    );
}

function actualizarReporteLighthouse(idReporte, rutaReporte, informacion){
    /*return db.reportes.update({
        idReporte: idReporte}, {$set: {urlReporte: rutaReporte, informacion: informacion}}, {multi: true}
    );*/
    return db.reportes.update({
        idReporte: idReporte}, {$set: {urlReporte: rutaReporte, fechaProcesamiento: Date.now}}, {multi: true}
    );
}

function actualizarReporteMutode(idReporte, urlLog){
    return db.reportes.update({
        idReporte: idReporte}, {$set: {urlLog: urlLog, fechaProcesamiento: Date.now}}, {multi: true}
    );
}

function guardarComparacionImagenes(idComparacionVisual, idImagen1, idImagen2, rutaImagenComparacion, informacion){
    return db.comparacionesvisuales.save({
        idComparacionVisual: idComparacionVisual,
        idImagen1: idImagen1,
        idImagen2: idImagen2,
        rutaImagenComparacion: rutaImagenComparacion,
        informacion: informacion,
        fechaCreacion: Date.now
    });
}


function incrementarSecuenciaImagenes(nombreSecuencia){
    return db.seqimagenes.findAndModify({
        query: {sequenceName: nombreSecuencia},
        update: {$inc: {sequenceValue: 1}},
        new: true
      });
}

function incrementarSecuenciaComparacionesVisuales(nombreSecuencia){
    return db.seqcomparacionesvisuales.findAndModify({
        query: {sequenceName: nombreSecuencia},
        update: {$inc: {sequenceValue: 1}},
        new: true
      });
}

 function consultarUltimaImagenPrueba(idPrueba){
    return db.reportes.aggregate([
        {$match:{idPrueba:idPrueba, indEstado:ESTADO_PROCESADO}},
        {$group: {_id:null,max:{$max:"$idReporte"}}}
    ]).then((results) => {
        if(results != undefined && results != ""){
            var idReporte = results[0].max;
            return getImagenesReporte(idReporte)
            .then((results) => {
                return results;
            });
        }
        else{
            return "";
        }
    }); 
}


function lanzarCypress(nombreScreenshot, nombreVideo, rutaConfiguracionArchivo, reporte, aplicacion, herramienta, imagenesAnteriores){
    //var ultimaImagen = await consultarUltimaImagenReporte(reporte.idReporte, 1);
    cypress.run({
        spec: rutaConfiguracionArchivo,
        env:{
            urlAplicacion: aplicacion.urlAplicacion,
            nombreAplicacion: aplicacion.nombreAplicacion,
            screen: nombreScreenshot,
        }
    }).then((results) => {
        var cypress = results;
        var rutaVideo = "";
        var rutaImagenes = [];

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
        
            incrementarSecuenciaImagenes(IMAGEN_SEQ)
            .then((results) => {
                seqimagen = results;    
                rutaImagenes.forEach(function(rutaImagen, i){
                    db.imagenes.save({
                        idImagen: seqimagen.sequenceValue,
                        secueciaImagen: i + 1,
                        urlImagen: rutaImagen,
                        idReporte: reporte.idReporte,
                        fechaCreacion: Date.now
                    }).then((results) => {  
                        var imagenNueva = results;
                        incrementarSecuenciaComparacionesVisuales(COMPARACION_VISUAL_SEQ)
                        .then((results) => {
                            if(imagenesAnteriores != undefined && imagenesAnteriores != ""){
                                compararImagenes(results.sequenceValue, imagenesAnteriores[i].idImagen, imagenesAnteriores[i].urlImagen, imagenNueva.idImagen, imagenNueva.urlImagen);
                            }
                        });   

                    });    
                });	
            });
        //});    
        actualizarReporteCypress(reporte.idReporte, rutaVideo, cypress);
    }); 
}

function lanzarLighthouse(herramienta, aplicacion, prueba, reporte, rutaConfiguracionArchivo){
    var comando = herramienta.comandoEjecucion  + rutaConfiguracionArchivo + " " + aplicacion.urlAplicacion;
    var nombreReporte = "Reporte_" + reporte.idReporte + "_prueba_" + prueba.idPrueba + ".html";
    shell.exec(comando + " --output-path " + herramienta.rutaReportes + nombreReporte) + " -output html";
    //var salidaJson = shell.exec('lighthouse --chrome-flags="--headless" --output json' + " " + aplicacion.urlAplicacion);
    //console.log("------>" + salidaJson);
    actualizarReporteLighthouse(prueba.idPrueba, herramienta.rutaReportes);

    //actualizarReporteLighthouse(prueba.idPrueba, herramienta.rutaReportes, salidaJson);
}

function lanzarMutode(reporte, prueba, herramienta){
    var nombreLog = "Log_reporte_" + reporte.idReporte + "_prueba_" + prueba.idPrueba + ".log";
    shell.cd("mutode/");
    shell.exec(herramienta.comandoEjecucion);
    shell.mv(".mutode/mutants*.log" ,  "../"+herramienta.rutaLogs+nombreLog);
    urlLog = herramienta.rutaLogs + nombreLog;
    actualizarReporteMutode(idReporte, urlLog);
}


function compararImagenes(idComparacionVisual, idImagenAnterior, rutaImagenAnterior, idImagenNueva, rutaImagenNueva){
    
    const options = {};
    compare(rutaImagenAnterior, rutaImagenNueva, options, function (err, data) {
        if (err) {
            console.log('Ha ocurrido un error!' + err)
        } else {
            console.log('Se van a comparar las dos imagenes... ' + rutaImagenAnterior + " y " + rutaImagenNueva);
            var nombreImagen = "ComparacionVisual_" + idComparacionVisual + ".png";
            var rutaSalidaFisica = rutaImagenes + "resemblejs/" + nombreImagen;
            fs.writeFile(rutaSalidaFisica, data.getBuffer());
            guardarComparacionImagenes(idComparacionVisual, idImagenAnterior, idImagenNueva, rutaSalidaFisica, JSON.stringify(data));								
        }	
    });	
}
