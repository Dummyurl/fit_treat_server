const User = require('../models/user');
const setUserInfo = require('../helper').setUserInfo;
const activeUserData = require('../helper').setActiveUserData;

var app = require('../app');

module.exports = {
    
    greetings(req,res){
        res.status(200).send('Hello World');
    },

    register(req,res,next){
        const email = req.body.email;
        User.findOne({email:email},(err,existingUser)=>{
            if(err){
                return next(err);
            }
            if(existingUser){
                res.status(422).send({error:"Email already in use"});
            }else{
                let user = new User(req.body);
                let content = "Dear " + user.firstName + ", <br><br> Welcome to FitTreat.<br><br> Team FitTreat";
                user.messages = [{subject:"Welcome",content:content}]
                User.create(user,(err,user)=>{
                    if(err){
                        return next(err);
                    }
                    res.redirect(302,'./../api/loggedInUser/'+user.id);
                  //  res.redirect(302,'/success');
                });
            }
        });
    },

    activeUser(req,res,next){
        console.log("User ID : " + req.params.id);
        User.findById(req.params.id,(err,user)=>{
            if(err){
                return next(err);
            }
            res.send(activeUserData(user));
        })
    }
}

