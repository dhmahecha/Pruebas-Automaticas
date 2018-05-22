var kue = require('kue-scheduler');
var Queue = kue.createQueue();
const mongoist = require('mongoist');
const db = mongoist(process.env.CONEXION_MONGO_TOOL);
const cypress = require('cypress');
var shell = require('shelljs');
const fs = require('fs');

const HERRAMIENTA_CYPRESS = 1;
const NYGTHWATCH = 2;
const LIGHTHOUSE = 3;
const MUTODE = 4;

const IMAGEN_SEQ = "seq_imagenes";

let archivo = "./escribir.txt"

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
    const coleccionReportes = await db.reportes.find({indEstado:1});
     coleccionReportes.forEach(reporte => {
         
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
                            var rutaConfiguracionArchivo = herramienta.rutaConfiguracion + prueba.nombreArchivo;

                            if(heramientaaplicacion.idHerramienta == HERRAMIENTA_CYPRESS){
                                lanzarCypress(nombreScreenshot, nombreVideo, rutaConfiguracionArchivo, reporte, aplicacion, herramienta);
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

function actualizarEstadoReporte(idReporte){
    return db.reportes.findAndModify({
        query: { idReporte: idReporte },
        update: { $set: { indEstado: 2 } },
        new: true
      });
}

function actualizarReporteCypress(idReporte, rutaVideo, cypress){
    return db.reportes.update({
        idReporte: idReporte}, {$set: {urlVideo: rutaVideo, informacion: JSON.stringify(cypress)}}, {multi: true}
    );
}

function actualizarReporteLighthouse(idReporte, rutaReporte, informacion){
    /*return db.reportes.update({
        idReporte: idReporte}, {$set: {urlReporte: rutaReporte, informacion: informacion}}, {multi: true}
    );*/
    return db.reportes.update({
        idReporte: idReporte}, {$set: {urlReporte: rutaReporte}}, {multi: true}
    );
}

function actualizarReporteMutode(idReporte, urlLog){
    return db.reportes.update({
        idReporte: idReporte}, {$set: {urlLog: urlLog}}, {multi: true}
    );
}

function incrementarSecuenciaImagenes(nombreSecuencia){
    return db.seqimagenes.findAndModify({
        query: { sequenceName: nombreSecuencia },
        update: { $inc: { sequenceValue: 1 } },
        new: true
      });
}

function lanzarCypress(nombreScreenshot, nombreVideo, rutaConfiguracionArchivo, reporte, aplicacion, herramienta){

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

        rutaImagenes.forEach(function(rutaImagen, i){
            incrementarSecuenciaImagenes(IMAGEN_SEQ).
            then((results) => {
                seqimagen = results;
                db.imagenes.save({
                    idImagen: seqimagen.sequenceValue,
                    urlImagen: rutaImagen,
                    idReporte: reporte.idReporte,
                    fechaCreacion: Date.now 
                });
            });	
        });

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


function escibir(archivo, handler) {
    fs.writeFile(archivo,"prueba" , handler);
}