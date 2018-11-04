const Meal = require('../models/meal');
   //***********************************
   //Image Folder URL - Local System
   //const rootUrl = 'C:/Users/balkrishna.meena/Desktop/ConsultApp/Data Set/images/';
   //***********************************
  
    //*********************************** 
    // Image Folder URL - Cloud System 0
    //cloud url
    const rootUrl = 'https://s3.us-east-2.amazonaws.com/fittreatstorage/meal_images_dev/';
    //***********************************
module.exports = {

    /* Add Meal Data */

    addMealData(req,res,next){
        let mealArray = req.body;
        for (let i = 0; i < mealArray.length; i++) {
            Meal.findOne({name:mealArray[i].name}).then(existingMeal=>{
                if(existingMeal === null){
                    mealArray[i].photoURL = rootUrl + mealArray[i].photoURL;
                    Meal.create(mealArray[i]).then(meal=>{
                    }).catch(err=>{return next(err);})
                }
            }).catch(err=>{return next(err)});
        }
        res.send({status:"processing"});
    }
}