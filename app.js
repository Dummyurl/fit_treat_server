const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/main');
const bodyParser = require('body-parser');
const routes = require('./routes/route');

mongoose.connect(config.database, {
    useNewUrlParser: true
});
app.use(bodyParser.urlencoded());
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
routes(app);
module.exports = app;