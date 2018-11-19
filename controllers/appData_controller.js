const AppData = require('../models/appData');

module.exports = {

    setAppDefaultData(req,res,next){
        AppData.findOne({_id:req.params.id},(err,data)=>{
            data.aboutSection = req.body.aboutSection;
            data.references = req.body.references;
            data.save().then(data=>{
                res.status(200).send({status:"success"});
            }).catch(err=>{
                return next(err);
            })
        });
    },

    getAppDefaultData(req,res,next){
        AppData.find((err,data)=>{
            if(err){
                return next(err);
            }
            res.status(200).send(data);
        })
    }
}