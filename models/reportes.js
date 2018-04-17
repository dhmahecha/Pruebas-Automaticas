// app/models/reportes.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReportesSchema   = new Schema({
    idReporte: Number,
    idPrueba: Number,
    urlVideo: String,
    urlLog: String,
    urlReporte: String,
    informacion: String,
    fechaReporte: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reportes', ReportesSchema);