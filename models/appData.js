const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppDataSchema = new Schema({
    aboutSection:{
        type:String,
        default:"This is a test html text"
    },
    references:{
        type:String,
        default:"This is a test references text"
    }
});

const AppData = mongoose.model('appdata',AppDataSchema);
module.exports = AppData;