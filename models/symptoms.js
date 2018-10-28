const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SymptomSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    indications:String,
    medicines:[{type:Schema.Types.ObjectId,ref:'medicine'}]
});

const Symptom = mongoose.model('symptom',SymptomSchema);
module.exports = Symptom;