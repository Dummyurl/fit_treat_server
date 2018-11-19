const Meal = require('../models/meal');
const User = require('../models/user');
//***********************************
// Image Folder URL
const rootUrl = require('../config/main').s3URL;
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
    },

    filterMeals(req,res,next){
        type = req.params.type;
        foodPref = req.params.foodPref;
        userId = req.params.userId;
        // Set flag only when Breakfast,Lunch,Dinner filters are needed
        userDataFetchFlag = false;
        // type : Snacks, Liquids
        srchArr = [];
        if(type=== "Snacks"){
            srchArr.push("Snacks");
        }else if(type === "Breakfast"){
            srchArr.push("Breakfast");
            userDataFetchFlag = true;
        }else if(type === "Lunch"){
            srchArr.push("Lunch");
            userDataFetchFlag = true;
        }else if(type === "Dinner"){
            srchArr.push("Dinner");
            userDataFetchFlag = true;
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
        vegQuery = Meal.find({foodPreference:{$in:foodPref},course:{$in:srchArr}}).limit(vegLimit);
        queryArr.push(vegQuery);
        if(foodPref === "Non-Vegetarian"){
            nonVegQuery = Meal.find({foodPreference:{$in:["Non-Vegetarian"]},course:{$in:srchArr}}).limit(nonVegLimit);
            queryArr.push(nonVegQuery);
        }

        if(userDataFetchFlag){
            User.findById(userId,(err,user)=>{
                mealAssigned = user.mealAssigned;
                vegQuery = Meal.find({mealAssigned:{$in:mealAssigned},foodPreference:{$in:foodPref},course:{$in:srchArr}}).limit(vegLimit);
                queryArr.push(vegQuery);
                if(foodPref === "Non-Vegetarian"){
                    nonVegQuery = Meal.find({mealAssigned:{$in:mealAssigned}},{foodPreference:{$in:["Non-Vegetarian"]},course:{$in:srchArr}}).limit(nonVegLimit);
                    queryArr.push(nonVegQuery);
                }
                Promise.all(queryArr).then(data=>{
                    res.status(200).send(data[0]);
                }).catch(err=>{
                    return next(err);
                });
            })
        }else{
            Promise.all(queryArr).then(data=>{
                res.status(200).send(data[0]);
            }).catch(err=>{
                return next(err);
            });
        }
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
      Meal.find().then(data=>{
            res.status(200).send(data);
        }).catch(err=>{
            return next(err);
        }) 
   },

   updateMeal(req,res,next){
       Meal.find({id:parseInt(req.params.id)},(err,meal)=>{
           if(err){
               return next(err);
           }
           res.status(200).send({status:"Meal Updated Successfully"});
       })
   },

   deleteMeal(req,res,next){
       Meal.remove({_id:parseInt(req.params.id)},(err,res)=>{
           if(err){
               return next(err);
           }
           res.status(200).send(res);
       })
   }
}