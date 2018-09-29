const mongoose = require('mongoose');
//const MessageSchema = require('./messages');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const MessageSchema = new Schema({
    subject:String,
    createDate:{type:Date,default:Date.now},
    readFlag:{
        type:Boolean,
        default:false
    },
    content:String
});

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName:String,
    email: {
        type: String,
        unique:true,
        lowercase:true,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    role:{
        type:String,
        enum:['User','Admin'],
        default:'User'
    },
    dateOfBirth:{
        type:String, // 'YYYY/MM/DD type string
        required:true
    },
    age: {
        type: Number,
        required: false
    },
    // Store weight in kgs
    weight: {
        type: Number,
        required: true
    },
    // Store height in cms
    height: {
        type: Number,
        required: true
    },
    timeZone:String,
    bmi:Number,
    medicalCondition:String,
    targetWeight:Number,
    targetDate:Date,
    targetCalories:Number,
    accountCreationDate:{type:Date,default:new Date()},
    userPhoto:{
        type:String
    },
    messages:[MessageSchema]
});

UserSchema.virtual('unreadCount').get(function(){
    var msgObject = this.messages;
    var count = 0;
    for(let i = 0; i<msgObject.length;i++){
        if(msgObject[i].readFlag){
            ++count;
        }
    }

    return {totalCount:msgObject.length,unreadCount:count};
});



//= ===============================
// User ORM Methods
//= ===============================

// Pre-save of user to database, hash password if password is modified or new

UserSchema.pre('save', function (next) {
    const user = this,
      SALT_FACTOR = 5;
  
    if (!user.isModified('password')) return next();
  
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
      if (err) return next(err);
  
      bcrypt.hash(user.password, salt, null, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        //next();
      });
    });

    let dateString = user.dateOfBirth;
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    user.age = age;
    next();
  });

// Method to compare password for login
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) { return cb(err); }
  
      cb(null, isMatch);
    });
  };

const User = mongoose.model('user',UserSchema);
module.exports = User;