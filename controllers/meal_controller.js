const Meal = require('../models/meal');
const User = require('../models/user');
//***********************************
// Image Folder URL
const rootUrl = require('../config/main').s3URL;
const moment = require('moment');
//***********************************
module.exports = {

    /* Add Meal Data */

    addNewMeal(req,res,next){
        Meal.findOne({
            name:req.body.name
        },(existingMeal,err)=>{
            if(existingMeal){
                res.send(202).send({status:"Meal data already exists !"})
            }else{
                mealData = req.body;
                mealData.photoURL = rootUrl + mealData.photoURL;
                Meal.create(mealData,(err,meal)=>{
                    if (err){
                        return next(err);
                    }else{
                        res.status(200).send({status:"Meal added successfully"});
                    }
                })
            }
        })
    },

    addMealData(req, res, next) {
        let mealArray = req.body;
        let queryArr = [];
        for (let i = 0; i < mealArray.length; i++) {
            
            Meal.findOne({
                name: mealArray[i].name
            }).then(existingMeal => {
                if (existingMeal === null) {
                    mealArray[i].photoURL = rootUrl + mealArray[i].photoURL;
                    queryArr.push(Meal.create(mealArray[i]));
                }
            }).catch(err => {
                return next(err)
            });
        }

        Promise.all(queryArr).then(result=>{
            res.send(result);
        },err=>{
            return next(err);
        })
        
    },

    /* Assign Meals to the user 
        - User's food preferences: Done
        - User's Medical Condition: Done
        - User's Timezone/Meal plan reset in 24H period - Done

        - Meal Selection depending on the course - No Logic provided (Pending)
        - Meals limit - Total 15
        - For Vegetarian: Random Selection of Vegan + Vegetarian
        - For Non-Vegetarian - 5 Veg + Vegan (Random Selection) + 10 Non-Vegetarian
    
    */
    getMeals(req,res,next){
        User.findById(req.params.userId).populate('meals').exec((err,user)=>{
            if(err){
                return next(err);
            }
            newMealsFlag = false;
            if(user && user.mealExpiry){
                /* 
                    If Meal plan has expired - Check 1
                */

                curDate = new Date();
                utcMils = curDate.getTime();
                localTime = utcMils + parseInt(user.timeZone);
                //Check expiry time
                if(localTime > user.mealExpiry){
                    newMealsFlag = true;
                }else{
                    Meal.find({_id:{$in:user.mealAssigned}},(err,meals)=>{
                        if(err){
                            return next(err);
                        }
                        res.status(200).send(meals);
                    })
                }
            }else{
                //Generate new plan 
               newMealsFlag = true;
            }
            if(newMealsFlag){
                /* 
                    User's medical condition consideration - Check 2
                */
                usersMedicalCondition = user.medicalCondition;

                // Meal Preference Counts initialize
                foodPref = [];
                vegLimit = 15;
                nonVegLimit = 0;
                if(user.foodPreference === "Vegan"){
                    foodPref = ["Vegan"];
                }else if(user.foodPreference === "Vegetarian"){
                    foodPref = ["Vegan","Vegetarian"];
                }else{
                    foodPref = ["Vegan","Vegetarian"];
                    vegLimit = 5;
                    nonVegLimit = 10;
                }
                queryArr = [];
                vegQuery = Meal.find({id:{$nin:user.mealAssigned},foodPreference:{$in:foodPref},medicalCondition:{$nin:[usersMedicalCondition]}}).limit(vegLimit);
                queryArr.push(vegQuery);
                if(user.foodPreference === "Non-Vegetarian"){
                    nonVegQuery = Meal.find({id:{$nin:user.mealAssigned},foodPreference:{$in:["Non-Vegetarian"]},medicalCondition:{$nin:[usersMedicalCondition]}}).limit(nonVegLimit);
                    queryArr.push(nonVegQuery);
                }
                Promise.all(queryArr).then((result)=>{
                    if(result[1]){
                        generatedPlan = result[0].concat(result[1]);
                    }else{
                        generatedPlan = result[0];
                    }
                    /* 
                        Assigning Meal Expiration Date
                    */
                    curDate = new Date();
                    utcMils = curDate.getTime();
                    localTime = utcMils + parseInt(user.timeZone); // Considering timezone offset
                    newDt = new Date(localTime);
                    newDay = newDt.getDate();
                    newDt.setDate(newDay + 1);
                    newDt.setHours(5,0,0,0);
    
                    //Setting assigned meals expiry time
                    user.mealExpiry = newDt.getTime();
                    user.mealAssigned = generatedPlan;
                    user.save().then(data=>{
                        res.status(200).send(data.mealAssigned);
                    })
                }).catch(err=>{
                    return next(err);
                });

            }
        })
    },

    /* 
        Service to filter meals

        -Consider user's medical condition
    */

    filterMeals(req,res,next){
        type = req.params.type;
        foodPref = req.params.foodPref;
        userId = req.params.userId;

        User.findById(userId,(err,user)=>{
            if(err){
                return next(err);
            }
            usersMedicalCondition = user.medicalCondition;
            srchArr = [];
            exstMealSrchFlag = false;
            if(type=== "Snacks"){
                srchArr.push("Snack");
            }else if(type === "Breakfast"){
                srchArr.push("Breakfast");
                exstMealSrchFlag = true;
            }else if(type === "Lunch"){
                srchArr.push("Lunch");
                exstMealSrchFlag = true;
            }else if(type === "Dinner"){
                srchArr.push("Dinner");
                exstMealSrchFlag = true;
            }else{
                srchArr.push("Soup");
                srchArr.push("Juice");
            }
            
            vegLimit = 10;
            nonVegLimit = 0;
            if(foodPref === "Vegan"){
                foodPref = ["Vegan"];
            }else if(foodPref === "Vegetarian"){
                foodPref = ["Vegan","Vegetarian"];
            }else{
                foodPref = ["Vegan","Vegetarian"];
                vegLimit = 5;
                nonVegLimit = 5;
            }
            queryArr = [];
            vegQuery = Meal.find({foodPreference:{$in:foodPref},course:{$in:srchArr},avoidableMedCond:{$nin:[usersMedicalCondition]}}).limit(vegLimit);
            queryArr.push(vegQuery);
            if(foodPref === "Non-Vegetarian"){
                nonVegQuery = Meal.find({foodPreference:{$in:["Non-Vegetarian"]},course:{$in:srchArr},avoidableMedCond:{$nin:[usersMedicalCondition]}}).limit(nonVegLimit);
                queryArr.push(nonVegQuery);
            }
            if(exstMealSrchFlag){
                    mealAssigned = user.mealAssigned;
                    vegQuery = Meal.find({id:{$in:mealAssigned},foodPreference:{$in:foodPref},course:{$in:srchArr}});
                    queryArr.push(vegQuery);
                    if(foodPref === "Non-Vegetarian"){
                        nonVegQuery = Meal.find({id:{$in:mealAssigned}},{foodPreference:{$in:["Non-Vegetarian"]},course:{$in:srchArr}});
                        queryArr.push(nonVegQuery);
                    }
                    Promise.all(queryArr).then(data=>{
                        res.status(200).send(data[0]);
                    }).catch(err=>{
                        return next(err);
                    });
            }else{
                Promise.all(queryArr).then(data=>{
                    res.status(200).send(data[0]);
                }).catch(err=>{
                    return next(err);
                });
            }
        })
    },

    /* 
        Admin Services
    */

   getMealsList(req,res,next){
      // let skipCount = parseInt(req.params.skip);
      // let top = parseInt(req.params.top);
/*        Meal.find().skip(skipCount).limit(top).then(data=>{
           res.status(200).send(data);
       }).catch(err=>{
           return next(err);
       })  */
       /* 
        Removed skip and count
       */
     Meal.find((err,result)=>{
         if(err){
             return next(err);
         }
         res.status(200).send(result);
     })
   },

   updateMeal(req,res,next){
       let mealObj = req.body;
       //mealData.photoURL = rootUrl + mealData.photoURL;
       Meal.findByIdAndUpdate(req.params.id,{$set:{
        name:mealObj.name,
        foodPreference:mealObj.foodPreference,
        cuisine:mealObj.cuisine,
        dietType:mealObj.dietType,
        idealMedCond:mealObj.idealMedCond,
        avoidableMedCond:mealObj.avoidableMedCond,
        course:mealObj.course,
        calories:mealObj.calories,
        servingSize:mealObj.servingSize,
        nutritionInfo:mealObj.nutritionInfo,
        ingredients:mealObj.ingredients,
        directions:mealObj.directions,
        photoURL:rootUrl + mealObj.photoURL
       }},{new:true},(err,meal)=>{
           if(err){
               return next(err);
           }
           res.status(200).send(meal);
       })
   },

   deleteMeal(req,res,next){
       Meal.remove({_id:parseInt(req.params.id)},(err,result)=>{
           if(err){
               return next(err);
           }
           res.status(200).send(result);
       })
   },

   /* Test Method */

/*    implicitEndTest(req,res,next){
        Meal.find({foodPreference:{$in:req.body.foodPref},avoidableMedCond:{$nin:[req.body.avoidMed]}},(err,result)=>{
            if(err){
                return next(err);
            }
            res.send(result);
        })
   } */
}