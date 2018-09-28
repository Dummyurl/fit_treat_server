const app = require('./app');
const config = require('./config/main');
app.listen(config.port,()=>{
    console.log('Application running on port :' + config.port);
})
