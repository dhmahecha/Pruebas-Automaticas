// app/models/regresionvisual.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ComparacionesVisualesSchema   = new Schema({
    idComparacionVisual: Number,
    idImagen1: Number,
    idImagen2: Number,
    rutaImagenComparacion: String,
    informacion: String,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComparacionesVisuales', ComparacionesVisualesSchema);
