const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
    name:String,
    dosage:String,
    instructions:String,
    ingredients:[String]
});

const Medicine = mongoose.model('medicine',MedicineSchema);
module.exports = Medicine;