// app/models/imagenes.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ImagenesSchema   = new Schema({
    idImagen: Number,
    idReporte: Number,
    urlImagen: String,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Imagenes', ImagenesSchema);
