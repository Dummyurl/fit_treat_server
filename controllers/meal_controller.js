const Meal = require('../models/meal');
const User = require('../models/user');
//***********************************
//Image Folder URL - Local System
const rootUrl = 'C:/Users/balkrishna.meena/Desktop/ConsultApp/Data Set/images/';
//***********************************

//*********************************** 
// Image Folder URL - Cloud System
//const rootUrl = 'https://s3.us-east-2.amazonaws.com/fittreatstorage/meal_images_dev/';
//***********************************
module.exports = {

    /* Add Meal Data */

    addMealData(req, res, next) {
        let mealArray = req.body;
        for (let i = 0; i < mealArray.length; i++) {
            Meal.findOne({
                name: mealArray[i].name
            }).then(existingMeal => {
                if (existingMeal === null) {
                    mealArray[i].photoURL = rootUrl + mealArray[i].photoURL;
                    Meal.create(mealArray[i]).then(meal => {}).catch(err => {
                        return next(err);
                    })
                }
            }).catch(err => {
                return next(err)
            });
        }
        res.send({
            status: "processing"
        });
    },

    getMeals(req,res,next){
        User.findById(req.params.userId,(err,user)=>{
            if(err){
                return next(err);
            }
            foodPref = [];
            vegLimit = 15;
            nonVegLimit = 0;
            newMealFlag = true;
            if(user.mealAssigned.length){
                newMealFlag = false;
            }
            if(user.foodPreference === "Vegan"){
                foodPref = ["Vegan"];
            }else if(user.foodPreference === "Vegetarian"){
                foodPref = ["Vegan","Vegetarian"];
            }else{
                foodPref = ["Vegan","Vegetarian"];
                vegLimit = 5;
                nonVegLimit = 10;
            }
            /* 
                if meals are not assigned to user generate new meal plan
            */
           let queryArr = [];
            if(newMealFlag){
                vegQuery = Meal.find({foodPreference:{$in:foodPref}}).limit(vegLimit);
                queryArr.push(vegQuery);
                if(user.foodPreference === "Non-Vegetarian"){
                    nonVegQuery = Meal.find({foodPreference:{$in:["Non-Vegetarian"]}}).limit(nonVegLimit);
                    queryArr.push(nonVegQuery);
                }
            }else{
                vegQuery = Meal.find({id:{$nin:user.mealAssigned},foodPreference:{$in:foodPref}}).limit(vegLimit);
                queryArr.push(vegQuery);
                if(user.foodPreference === "Non-Vegetarian"){
                    nonVegQuery = Meal.find({id:{$nin:user.mealAssigned},foodPreference:{$in:["Non-Vegetarian"]}}).limit(nonVegLimit);
                    queryArr.push(nonVegQuery);
                }
            }
            Promise.all(queryArr).then((result)=>{
                if(result[1]){
                    generatedPlan = result[0].concat(result[1]);
                }else{
                    generatedPlan = result[0];
                }
                user.mealAssigned = generatedPlan;
                user.save().then(data=>{
                    res.status(200).send(data.mealAssigned);
                })
            }).catch(err=>{
                return next(err);
            });
        });
    }
}