const express = require('express');
const passport = require('passport');
const UserController = require('../controllers/user_controller');
const passportService = require('../config/passport');
const MealController = require('../controllers/meal_controller');
const MedicineController = require('../controllers/medicine_controller');
const SymptomController = require('../controllers/symptoms_controller');
const AppDataController = require('../controllers/appData_controller');
const Meal = require('../models/meal');
const Medicine = require('../models/medicines');
const Symptom = require('../models/symptoms');
const User = require('../models/user');
var path = require('path');
const moment = require('moment');

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
        /* Pull Active User Details - Used For Redirection after user authentication */
    apiRoutes.get('/loggedInUser/:id',UserController.activeUser);
        /* Forgot / Change Password - Sends Email */
    apiRoutes.get('/changePassword/:email',UserController.changePassword);
        /* Password reset request */
    apiRoutes.get('/passwordResetRedirect',(req,res,next)=>{
        token = req.query.token;
        userId = req.query.id;
        User.findById(userId,(err,user)=>{
            if(err){
                return next(err);
            }
            /* 
                Token Validation
            */
            if(user && user._id == userId && user.resetPasswordToken === token){
                /* 
                    Link expiry validation
                */
                if(moment().isBefore(user.resetPasswordExpires)){
                    res.cookie('token',user.resetPasswordToken,{maxAge:30000});
                    res.sendFile(path.resolve(__dirname+'/../public/passwordReset/passwordReset.html'));
                }else{
                    res.sendFile(path.resolve(__dirname+'/../public/passwordReset/passwordLinkExpired.html'));
                }
            }else{
                res.status(500).send({"stat":"Invalid Token"});
            }
        })
    });    
        /* Password Reset */
    apiRoutes.post('/resetPassword',UserController.resetPassword);    
        /* Change status of message to read/unread */
    apiRoutes.get('/readMessage/:docId/:msgId',UserController.messageReadStatusChange);
        /* Updates target weight, goal date, target calories */
    apiRoutes.put('/targetWeight',UserController.updateGoalWeight);
        /* Reloads messages */
    apiRoutes.get('/reloadMessages/:id',UserController.reloadMessages);
        /* Update User Profile */
    apiRoutes.put('/updateProfile',UserController.updateProfile);
        /*  User Photo Upload/Update Service */
    apiRoutes.post('/photoUpdate',UserController.userPhotoUpdate);
        /* Meal Suggestions */
    apiRoutes.get('/getMeals/:userId',MealController.getMeals);
        /* Meals Filters 
            type: Snacks, Juice
            foodPref: Vegan, Vegetarian, Non-Vegetarian
        */
    apiRoutes.get('/filterMeals/:type/:foodPref/:userId',MealController.filterMeals); 
        /* Initial Symptoms */
    apiRoutes.get('/initialSymptoms',SymptomController.first5Symptoms);
        /* Search Symptom */
    apiRoutes.get('/searchSymptoms/:searchParam',SymptomController.searchSymptom);
        /* Get App About/References Data */
    apiRoutes.get('/getAppData',AppDataController.getAppDefaultData);
        /* Post New Message to Admin */
    apiRoutes.post('/sendMsgToAdmin',(req,res,next)=>{
        let senderId = req.body.id;
        let msg = req.body.msg;
        res.status(200).send({msg:"Thank you for reaching out to us. Will revert asap."});
    });
    //===========================
    // ADMIN Routes
    //===========================
    app.use('/admin', adminRoutes);

        /* Edit App Data  */
    adminRoutes.put('/editAppData/:id',AppDataController.setAppDefaultData);    
        /* Add Meals in bulk */
    adminRoutes.post('/addMeals',MealController.addMealData);
        /* Add New Meal */
    adminRoutes.post('/addNewMeal',MealController.addNewMeal);
        /* Update Meal  */
    adminRoutes.put('/updateMeal/:id',MealController.updateMeal);   
        /* Remove Meal */
    adminRoutes.delete('/deleteMeal/:id',MealController.deleteMeal);
        /* Get Meals List */
    //adminRoutes.get('/getMealsList/:skip/:top',MealController.getMealsList);
    adminRoutes.get('/getMealsList',MealController.getMealsList);
        /* Add Medicines in bulk */
    adminRoutes.post('/addMedicines',MedicineController.addMedicines);
        /* Add New Medicine */
    adminRoutes.post('/addNewMedicine',MedicineController.addNewMedicine);
        /* Query all medicines */
    adminRoutes.get('/getAllMeds',MedicineController.getAllMedicines);
        /* Delete Medicines */
    adminRoutes.post('/deleteMeds',MedicineController.deleteMeds);
        /* Add Symptoms in bulk*/
    adminRoutes.post('/addSymptoms',SymptomController.addMedicineData);
        /* Add new Symptom */
    adminRoutes.post('/addNewSymptom',SymptomController.addNewSymptom);    
        /* Get All Symptoms */
    adminRoutes.get('/getAllSymptoms',SymptomController.getAllSymptoms);
        /* Delete Symptoms */
    adminRoutes.post('/deleteSymptoms',SymptomController.deleteSymptoms);
        /* Database Statistics */
    adminRoutes.get('/dbStats',(req,res,next)=>{
        let usrCount = User.estimatedDocumentCount();
        let mealCount = Meal.estimatedDocumentCount();
        let medCount = Medicine.estimatedDocumentCount();
        let sympCount = Symptom.estimatedDocumentCount();

          Promise.all([usrCount,mealCount,medCount,sympCount]).then(result=>{
             
            let obj = {"users":0,"meals":0,"medicines":0,"symptoms":0};
            let arrKeys = ["users","meals","medicines","symptoms"];    
            for(let i = 0 ;i<arrKeys.length;i++){
                obj[arrKeys[i]] = result[i];
            }
            res.send(obj);
        }).catch(err=>{
            return next(err);
        }) 
    });

        /* Bulk upload templates */
    adminRoutes.get('/templateDownload/:name',(req,res,next)=>{
        let templateName = req.params.name;
        let filePath = {
            meal:'./../public/mealData.xlsx',
            medicine:'./../public/medicineData.json',
            symptoms:'./../public/SymptomsData.json'
        };
        var resolvedPath = path.resolve(__dirname + filePath[templateName]);
            res.download(resolvedPath,(err)=>{
                console.error(err);
                return next(err);
            });
    });

        /* Drop collections service */
    adminRoutes.delete('/deleteCollection/:name',(req,res,next)=>{
        let collName = req.params.name;
         /*    
            "meals":Meal,
            "meds":Medicine,
            "symptoms":Symptom,
            "users":User 
        */
       console.log(collName);
        if(collName === "meals"){
            Meal.deleteMany((err,result)=>{
                if(err){
                    return next(err);
                }
                res.send(result);
            }); 
        }else if(collName === "meds"){
            Medicine.deleteMany((err,result)=>{
                if(err){
                    return next(err);
                }
                res.send(result);
            });
        }else if(collName === "symptoms"){
            Symptom.deleteMany((err,result)=>{
                if(err){
                    return next(err);
                }
                res.send(result);
            }); 
        }else if(collName === "users"){
            User.deleteMany((err,result)=>{
                if(err){
                    return next(err);
                }
                res.send(result);
            }); 
        }else{
            res.status(500).send({"msg":"Collection not specified"});
        }
    });
        /* Clear DB */
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
    });

}