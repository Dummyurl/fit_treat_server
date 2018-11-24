const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MealSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique:true
    },
    foodPreference: {
        type: String,
        enum: ["Vegan", "Vegetarian", "Non-Vegetarian"],
        default: "Vegetarian"
    },
    cuisine: String,
/*     mealType: {
        type: String,
        enum: ["Solid", "Liquid"],
        default: "Solid"
    }, */
    dietType: {
        type:[String],
        default:"No Data Available"
    }, //High Protein, High Calorie, Low Fat etc Diet Types
    idealMedCond: [String], // suitable medical conditions
    avoidableMedCond: [String], // medical conditions in which meal is to be avoided
    course: {
        type: ["String"],
        enum: ["Breakfast", "Lunch", "Dinner", "Snack","Soup","Juice"],
        default: "Snack"
    },
    calories: {
        type:Number,
        default:0
    },
    servingSize: {
        type:Number,
        default:0    
    },
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