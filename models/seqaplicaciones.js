// app/models/seqaplicaciones.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeqAplicacionesSchema   = new Schema({
    sequenceValue: Number,
    sequenceName: String
});

module.exports = mongoose.model('SeqAplicaciones', SeqAplicacionesSchema);
