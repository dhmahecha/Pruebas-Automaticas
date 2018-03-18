// app/models/reportes.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AplicacionesSchema   = new Schema({
    idAplicacion: Number,
    nombreAplicacion: String,
    urlAplicacion: String,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Aplicaciones', AplicacionesSchema);
