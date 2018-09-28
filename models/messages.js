const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    subject:String,
    createDate:{type:Date,default:Date.now},
    unreadFlag:{
        type:Boolean,
        default:false
    },
    content:String
});

const Message = mongoose.model('message',MessageSchema);
module.exports = MessageSchema;