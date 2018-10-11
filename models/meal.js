const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = require('./image');
const MealSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    foodPreference: {
        type: String,
        enum: ["Vegan", "Vegetarian", "Non Vegetarian"],
        default: "Vegetarian"
    },
    cuisine: String,
/*     mealType: {
        type: String,
        enum: ["Solid", "Liquid"],
        default: "Solid"
    }, */
    dietType: [String], //High Protein, High Calorie, Low Fat etc Diet Types
    idealMedCond: [String], // suitable medical conditions
    avoidableMedCond: [String], // medical conditions in which meal is to be avoided
    course: {
        type: ["String"],
        enum: ["Breakfast", "Lunch", "Dinner", "Snack","Soup"],
        default: "Snack"
    },
    calories: Number,
    servingSize: Number,
    nutritionInfo: String,
    ingredients: String,
    directions: String,
    photoURL: {
        type:String
     //   get: v => `${rootUrl}${v}`
    }
});

const Meal = mongoose.model('meal', MealSchema);
module.exports = Meal;