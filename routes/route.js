const express = require('express');
const passport = require('passport');
const UserController = require('../controllers/user_controller');
const passportService = require('../config/passport');
const helper = require('../helper').setUserInfo;

const requireLogin = passport.authenticate('local',{session:false});
module.exports = (app) => {

    app.use(passport.initialize());
    //app.use(passport.session());

    const authRoutes = express.Router();
    const adminRoutes = express.Router();
    const apiRoutes = express.Router();

    //===========================
    // Authentication Routes
    //===========================
    app.use('/auth', authRoutes);
    authRoutes.get('/test', UserController.greetings);
    authRoutes.post('/register', UserController.register);

    authRoutes.post('/login',requireLogin,(req,res) =>{
        res.redirect(302,'./../api/loggedInUser/'+req.user.id);
    });
    
    //===========================
    // API Routes
    //===========================
    app.use('/api',apiRoutes);
    apiRoutes.get('/loggedInUser/:id',UserController.activeUser);

    //===========================
    // ADMIN Routes
    //===========================
    app.use('/admin', adminRoutes);
    adminRoutes.get('/clearDB', (req, res) => {
        const mongoose = require('mongoose');
        mongoose.connection.db.dropDatabase()
            .then(res.send({
                status: "success"
            }))
            .catch((err) => {
                console.log(err);
                res.status(422).send({
                    status: "error"
                });
            })
    })

}