// app/models/seqcomparacionesvisuales.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeqComparacionesVisualesSchema   = new Schema({
    sequenceValue: Number,
    sequenceName: String
});

module.exports = mongoose.model('SeqComparacionesVisuales', SeqComparacionesVisualesSchema);

