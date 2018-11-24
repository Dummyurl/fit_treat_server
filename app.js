const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/main');
const bodyParser = require('body-parser');
const routes = require('./routes/route');
const AppData = require('./models/appData');


mongoose.connect(config.database, {
    useNewUrlParser: true
});

AppData.findOne((err,data)=>{
    if(err){
        console.error(err);
    }
    if(data){
        console.log("App Data Exists- No Action Done");
    }else{
        AppData.create(
            {aboutSection:`<hr></hr><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras orci ante, posuere ac nulla a, sagittis dignissim lacus. Vestibulum in ullamcorper magna. Ut sem nisl, accumsan id quam ac, pulvinar gravida enim. Praesent mattis finibus velit, vehicula sodales odio blandit in. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.<p><hr></hr>`,
            references:`BMI Calculation Formulae : <a href="https://www.icliniq.com/tool/weight-loss-by-goal-date-calculator">icliniq.com</a><br><hr></hr>Dietary Guidelines : <a href="https://www.choosemyplate.gov/dietary-guidelines">US Department of Agriculture</a>`
            },(err,data)=>{
                if(err){
                    console.error(err);
                }
                console.log("About App Data Persisted");
        })
    }
})

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

const allowedExt = [
    '.js',
    '.ico',
    '.css',
    '.png',
    '.jpg',
    '.woff2',
    '.woff',
    '.ttf',
    '.svg',
  ];

/*   app.use(express.static(__dirname + '/public/fitTreat-adminapp'));

  app.get('/adminApp', function(req,res) {   
    res.sendFile(path.join(__dirname+'/public/fitTreat-adminapp/index.html'));
  }); */
routes(app);
module.exports = app;