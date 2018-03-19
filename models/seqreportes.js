// app/models/reportes.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeqReportesSchema   = new Schema({
    sequenceValue: Number,
    sequenceName: String
});

module.exports = mongoose.model('SeqReportes', SeqReportesSchema);
