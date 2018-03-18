// app/models/pruebas.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PruebasSchema   = new Schema({
    idPrueba: Number,
    idHerramienta: Number,
    idAplicacion: String,
    rutaArchivo: String,
    fechaPrueba: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pruebas', PruebasSchema);
