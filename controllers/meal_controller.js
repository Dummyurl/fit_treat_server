const Meal = require('../models/meal');
/* 
    Image Folder URL - Local System
*/
const rootUrl = 'C:/Users/balkrishna.meena/Desktop/ConsultApp/Data Set/images';

/* 
    Image Folder URL - Cloud System

    const rootUrl = 'https://s3.us-east-2.amazonaws.com/fittreatstorage/dev_images';
*/
module.exports = {

    /* Add Meal Data */

    addMealData(req, res, next) {

        Meal.findOne({
            name: req.body.name
        }, (err, existingMeal) => {
            if (err) {
                return next(err);
            }
            if (existingMeal) {
                res.status(422).send({
                    status: "Meal data already exists",
                    data: existingMeal
                });
            } else {
                Meal.create(req.body, (err, meal) => {
                    if (err) {
                        return next(err);
                    }
                    meal.photoURL = rootUrl + meal.photoURL;
                    res.status(200).send(meal);
                });
            }
        })

    }

}