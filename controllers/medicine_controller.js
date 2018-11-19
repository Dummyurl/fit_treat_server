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
    },

    deleteMeds(req,res,next){
        let idArr = req.body;
        console.log(idArr);
        Medicine.remove({_id:{$in:idArr}})
            .then(result=>{
                res.status(200).send(result);
            }).catch(err=>{
                return next(err);
            })
    },

    addNewMedicine(req,res,next){
        Medicine.find({name:req.body.name},(err,meds)=>{
            if(err){
                return next(err);
            }
            if(Object.keys(meds).length){
                res.status(200).send({status:"Symptom already exists"});
            }else{
                Medicine.create(req.body,(err,resp)=>{
                    if(err){
                        return next(err);
                    }
                    res.status(200).send(resp);
                });
            }
        })
    }
}