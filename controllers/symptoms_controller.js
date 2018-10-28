const Symptoms = require('../models/symptoms');
const Medicine = require('../models/medicines');
const _ = require('lodash');

module.exports = {

    addMedicineData(req,res,next){
        let medData = req.body;
        _.forEach(medData,function(value){
            let symptom = value.symptom["name"];
            Symptoms.create({name:symptom},(err,symp)=>{
                let medSearchArr = [];
                _.forEach(value.medicines,function(medValue){
                    medSearchArr.push(medValue.Name);
                })
                Medicine.find({Name:{$in:medSearchArr}},(err,medicines)=>{
                    if(err){
                        return next(err);
                    }
                    symp.medicines = medicines;
                    symp.save((err,symptom)=>{
                        if(err){
                            return next(err);
                        }
                    });
                })
            })
        }); 
        res.status(200).send({status:"processing"});
    },

    first10Symptoms(req,res,next){
        Symptoms.find().populate('medicines').limit(5)
            .then(data=>{
                res.send(data);
            }).catch(err=>{
                return next(err);
            })

    },

    searchSymptom(req,res,next){
        Symptoms.find({name:{$regex:req.params.searchParam, $options:'i'}})
        .populate('medicines')
        .then(data=>{
            res.status(200).send(data);
        }).catch(err=>{
            return next(err);
        })
    }
}