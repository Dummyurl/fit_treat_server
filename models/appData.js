const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppDataSchema = new Schema({
    aboutSection:String,
    references:String
});

const AppData = mongoose.model('appdata',AppDataSchema);
module.exports = AppData;