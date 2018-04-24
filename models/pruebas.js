// app/models/pruebas.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PruebasSchema   = new Schema({
    idPrueba: Number,
    idHerramientaAplicacion: Number,
    nombreArchivo: String,
    fechaPrueba: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pruebas', PruebasSchema);
