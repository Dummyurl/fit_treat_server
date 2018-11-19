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
                    medSearchArr.push(medValue.name);
                })
                Medicine.find({name:{$in:medSearchArr}},(err,medicines)=>{
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

    first5Symptoms(req,res,next){
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
    },

    getAllSymptoms(req,res,next){
        Symptoms.find()
            .populate('medicines')
            .then(data=>{
                res.status(200).send(data)
            })
            .catch(err=>{
                return next(err);
            })
    },

    deleteSymptoms(req,res,next){
        Symptoms.remove({_id:{$in:req.body}})
            .then(result=>{
                res.status(200).send(result);
            })
            .catch(err=>{
                return next(err);
            })
    },

    addNewSymptom(req,res,next){
        Symptoms.find({name:req.body.name},(err,symp)=>{
            if(err){
                return next(err);
            }
            if(Object.keys(symp).length){
                res.status(200).send({status:"Symptom already exists"});
            }else{
                Symptoms.create({name:req.body.name,medicines:req.body.medicines},(err,resp)=>{
                    if(err){
                        return next(err);
                    }
                    res.status(200).send(resp);
                });
            }
        })
       
    }
}