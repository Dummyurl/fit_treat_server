const express = require('express');
const passport = require('passport');
const UserController = require('../controllers/user_controller');
const passportService = require('../config/passport');
const MealController = require('../controllers/meal_controller');
const MedicineController = require('../controllers/medicine_controller');
const SymptomController = require('../controllers/symptoms_controller');
const AppDataController = require('../controllers/appData_controller');

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
        /* Bulk Upload Meal */
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
        /* Add Medicine  */
    adminRoutes.post('/addMedicines',MedicineController.addMedicines);
        /* Add New Medicine */
    adminRoutes.post('/addNewMedicine',MedicineController.addNewMedicine);
        /* Query all medicines */
    adminRoutes.get('/getAllMeds',MedicineController.getAllMedicines);
        /* Delete Medicines */
    adminRoutes.post('/deleteMeds',MedicineController.deleteMeds);
        /* Add Symptoms */
    adminRoutes.post('/addSymptoms',SymptomController.addMedicineData);
        /* Add new Symptom */
    adminRoutes.post('/addNewSymptom',SymptomController.addNewSymptom);    
        /* Get All Symptoms */
    adminRoutes.get('/getAllSymptoms',SymptomController.getAllSymptoms);
        /* Delete Symptoms */
    adminRoutes.post('/deleteSymptoms',SymptomController.deleteSymptoms);

    adminRoutes.get('/adminApp',(req,res)=>{
        res.sendFile(__dirname+'/test.html');
    })
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