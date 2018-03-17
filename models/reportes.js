// app/models/reportes.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReportesSchema   = new Schema({
    ruta_img_base: String,
    ruta_img_modificada: String,
    ruta_img_salida: String,	
    diferencias: String,
    informacion: String,
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reportes', ReportesSchema);
