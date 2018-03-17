// app/models/herramientaspruebas.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var HerramientasPruebasSchema   = new Schema({
    NOMBRE: String,
    RUTA_EJECUTABLE: String,
    RUTA_LOGS: String,	
    COMANDO_EJECUCION: String,
    FECHA_CREACION: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HerramientasPruebas', HerramientasPruebasSchema);
