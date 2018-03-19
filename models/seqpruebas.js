// app/models/seqpruebas.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeqPruebasSchema   = new Schema({
    sequenceValue: Number,
    sequenceName: String
});

module.exports = mongoose.model('SeqPruebas', SeqPruebasSchema);

