const User = require('../models/user');
const setUserInfo = require('../helper').setUserInfo;
const activeUserData = require('../helper').setActiveUserData;
const Meal = require('../models/meal');
const Cryptr = require('cryptr');
const crypKey = require('../config/main').crptrKey;
const nodeMailer = require('nodemailer');
const config = require('../config/main')
const cryptr = new Cryptr(crypKey);
const moment = require('moment');
const path = require('path');
var self = module.exports = {

    greetings(req, res) {
        res.status(200).send('Hello World');
    },
    /* 
        New User Registration
    */
    register(req, res, next) {
        const email = req.body.email;
        User.findOne({
            email: email
        }, (err, existingUser) => {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                res.status(422).send({
                    error: "Email already in use"
                });
            } else {
                let user = new User(req.body);
                let content = "Dear " + user.firstName + ", <br><br> Welcome to FitTreat.<br><br> Team FitTreat";
                user.messages = [{
                    subject: "Welcome",
                    content: content
                }]
                User.create(user, (err, user) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(302, './../api/loggedInUser/' + user.id);
                });
            }
        });
    },
    /* 
        Returns Active User Details
    */
    activeUser(req, res, next) {
        User.findById(req.params.id, (err, user) => {
            if (err) {
                return next(err);
            }
            res.status(200).send(activeUserData(user));
        })
    },
    /* 
        Updates message read/unread status
    */
    messageReadStatusChange(req, res, next) {
        User.findById(req.params.docId, (err, user) => {
            if (err) {
                return next(err);
            }
            let message = user.messages.id(req.params.msgId);
            message.readFlag = !(message.readFlag);
            user.save(message)
                .then(user => {
                    res.status(200).send(user.messages.id(req.params.msgId));
                })
                .catch(err => {
                    return next(err);
                });
        })
    },

    /* 
        Update Goal Weight and Goal Date Service
    */

    updateGoalWeight(req, res, next) {
        User.update({
            _id: req.body.id
        }, {
            $set: {
                targetWeight: req.body.targetWeight,
                targetDate: req.body.targetDate,
                targetCalories: req.body.targetCalories,
                weightUnit:req.body.weightUnit
            }
        }, (err, stat) => {
            if (err) {
                return next(err);
            }
            res.status(200).send({status:"success"});
        })
    },

    /* 
        Reload messages
    */

    reloadMessages(req,res,next){
        User.findById(req.params.id,(err,user)=>{
            if(err){
                return next(err);
            }
            
            res.status(200).send({msgSummary:user.unreadCount,messages:user.messages});
        });
    },

    /* 
        Update User Profile
    */

    updateProfile(req,res,next){
        User.findByIdAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                weight: req.body.weight,
                weightUnit:req.body.weightUnit,
                height: req.body.height,
                heightUnit:req.body.heightUnit,
                foodPreference:req.body.foodPreference,
                medicalCondition: req.body.medicalCondition,
                firstName:req.body.firstName,
                lastName:req.body.lastName
            }
        },{new:true}, (err, user) => {
            if (err) {
                return next(err);
            }
            res.status(200).send(activeUserData(user));
        });

    },

    /* 
        User Photo Upload/Update Service
    */

   userPhotoUpdate(req,res,next){
        User.findByIdAndUpdate({
            _id:req.body.id
        },{
            $set:{
                userPhoto:req.body.userPhoto
            }
        },{new:true},(err,user)=>{
            if(err){
                return next(err);
            }
            res.status(200).send({id:user._id,photoString:user.userPhoto});
        })
   },

   changePassword(req,res,next){
       userEmail = req.params.email;
    
       User.findOne({email:userEmail},(err,user)=>{
           if(err){
               return next(err);
           }
            userId = user._id;
            resetToken = cryptr.encrypt(userId + "r353tT0k3n");
            resetExpiryTime = new Date();
            mins = resetExpiryTime.getMinutes();
            resetExpiryTime.setMinutes(mins + 30);
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetExpiryTime;
            userName = user.firstName;
            user.save().then(result=>{
                link = "http://localhost:8888/api/passwordResetRedirect/?token="+resetToken+"&id="+userId;
                
                /* 
                    Email Body
                */
                html = `<html>
                        <body>
                        <table border="0" width="100%" cellspacing="0" cellpadding="0"><!-- start hero -->
                        <tbody>
                        <tr>
                        <td align="center" bgcolor="#e9ecef">
                        <table border="0" width="600" cellspacing="0" cellpadding="0" align="center">
                        <tbody>
                        <tr>
                        <td align="center" valign="top" width="600">
                        <table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0">
                        <tbody>
                        <tr>
                        <td style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;" align="left" bgcolor="#ffffff">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1>
                        </td></tr></tbody></table></td></tr><tr>
                        <td align="center" bgcolor="#e9ecef">
                        <table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0">
                        <tbody>
                        <tr>
                        <td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;" align="left" bgcolor="#ffffff">
                        <p style="margin: 0;">Hi `
                        + userName + ',' 
                        + `<p style="margin: 0;">Follow the link to reset your account password. If you didn't request a new password, you can safely delete this email.</p>
                        </td></tr><tr>
                        <td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;" align="left" bgcolor="#ffffff">
                        <p style="margin: 0;">The link is valid for 30 minutes only.</p><a href=`
                        + link
                        + ` target="_blank">Click Here</a>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf;" align="left" bgcolor="#ffffff">
                        <p style="margin: 0;">Cheers,<br /> FitTreat</p>
                        </td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></body>
                        </html>`;
           
                let mailOptions = {
                from:'"FitTreat appconsultme@gmail.com',
                //from:'FitTreat app116066240@heroku.com',
                to:userEmail,
                subject:'FitTreat : Password Reset',
                html:html
            }

            transporter = nodeMailer.createTransport({
                //gmail host
                host:"smtp.gmail.com",
                //host:"smtp.sendgrid.net",
                port:465,
                secure:true,
                auth:{
                    user:config.userId,
                    pass:config.password
                }
            });

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(400).send({"msg": "Some error occurred."});
                } else {
                    res.status(200).send({"msg": "Please check your registered email"});
                }
            });

            }).catch(err=>{
                return next(err);
            })
       });
   },

   resetPassword(req,res,next){
       let body = req.body;
       let token = body.token;
       let dob = body.dob;
       let password = body.password;
       let decryptToken = cryptr.decrypt(token);
       let userId = decryptToken.substr(0,decryptToken.indexOf("r353tT0k3n"));
       User.findById(userId).then(user=>{
        if(moment().isBefore(user.resetPasswordExpires)){
            if(user.dateOfBirth === dob){
                user.password = password;
                user.save().then(result=>{
                    res.sendFile(path.resolve(__dirname+'/../public/passwordReset/passwordChangeSuccess.html'));
                })
            }else{
                res.status(500).send({msg:"DOB did not match"});
            }
        }else{
            res.sendFile(path.resolve(__dirname+'/../public/passwordReset/passwordLinkExpired.html'));
        }
       })
       
   }
}