const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    subject:String,
    createDate:Date,
    unreadFlag:{
        type:Boolean,
        default:false
    }
});

const Message = mongoose.model('message',MessageSchema);
module.exports = MessageSchema;