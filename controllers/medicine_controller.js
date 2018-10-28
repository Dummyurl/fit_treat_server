const Medicine = require('../models/medicines');
module.exports = {

    addMedicines(req,res,next){
        Medicine.insertMany(req.body,(err,meds)=>{
            if(err){
                return next(err);
            }
            res.status(200).send(meds);
        })
    },

    getAllMedicines(req,res,next){
        Medicine.find((err,meds)=>{
            if(err){
                return next(err);
            }
            res.status(200).send(meds);
        })
    }
}