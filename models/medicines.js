const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
    Name:String,
    Dosage:String,
    Instructions:String,
    Ingredients:[String]
});

const Medicine = mongoose.model('medicine',MedicineSchema);
module.exports = Medicine;