// app/models/herramientasaplicaciones.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var HerramientasAplicacionesSchema   = new Schema({
    idHerramientaAplicacion: Number,
    idHerramienta: Number,
    idAplicacion: Number,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HerramientasAplicaciones', HerramientasAplicacionesSchema);
