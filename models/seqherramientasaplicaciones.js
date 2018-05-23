// app/models/seqherramientasaplicaciones.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeqHerramientasAplicacionesSchema   = new Schema({
    sequenceValue: Number,
    sequenceName: String
});

module.exports = mongoose.model('SeqHerramientasAplicaciones', SeqHerramientasAplicacionesSchema);
