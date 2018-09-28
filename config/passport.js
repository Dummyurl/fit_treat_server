const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

const localOptions = {usernameField : 'email'};

const localLogin = new LocalStrategy(localOptions,(email,password,done)=>{
    User.findOne({email:email},(err,user)=>{
        if(err){ return next(err);}
        if(!user){console.log("invalid") ;return done(null,false,{error:"Invalid credentials"})}

        user.comparePassword(password,(err,isMatch)=>{
            if(err){return done(err);}
            if(!isMatch){
                return done(null,false,{error:"Invalid Credentials"});
            }
            return done(null,user);
        })
    })
});

passport.use(localLogin);