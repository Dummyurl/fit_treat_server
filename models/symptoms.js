const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SymptomSchema = new Schema({
    
});

const Symptom = mongoose.model('symptom',SymptomSchema);
module.exports = Symptom;