const User = require('../models/user');
const setUserInfo = require('../helper').setUserInfo;
const activeUserData = require('../helper').setActiveUserData;
const Meal = require('../models/meal');

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
}