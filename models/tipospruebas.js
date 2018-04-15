// app/models/tipospruebas.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TiposPruebasSchema   = new Schema({
    idTipoPrueba: Number,
    nombreTipoPrueba: String,
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TiposPruebas', TiposPruebasSchema);
