// app/models/herramientaspruebas.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var HerramientasPruebasSchema   = new Schema({
    idHerramienta: Number, 
    idTipoPrueba: Number,
    nombreHerramienta: String,
    rutaReportes: String,
    rutaHttpVideos: String,
    rutaFisicaVideos: String,
    rutaImagenes: String,
    rutaScreenshots: String,
    rutaLogs: String,
    comandoEjecucion: String,
    rutaConfiguracion: String,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HerramientasPruebas', HerramientasPruebasSchema);
