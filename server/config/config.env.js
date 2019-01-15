// Grab the config env file if it's there
var config;

try{
    config = require('./config.env');
} catch(e) {
    config = {};
    console.log("Error opening configuration file: " + e)
}

module.exports = function(){
    if(isEmpty(config)){
        //********************LOCAL ENVIRONMENT************************************
        //default values if configuration not present
        return { // mongodb://<hostname>:<port>/<database-name>
            'databaseURL' : 'mongodb://localhost:27017/quindar',
            'databaseOpts' : { useMongoClient : true }
        };
    } else {
        //values of NODE_ENV - 'staging', 'production', 'development'
        if(process.env.NODE_ENV) {
            return {
                'databaseURL' : config[process.env.NODE_ENV].databaseURL,
                'databaseOpts' : config[process.env.NODE_ENV].databaseOpts
            };
        } else { //return values for development environment in case NODE_ENV not set
            return {
                'databaseURL' : config.development.databaseURL,
                'databaseOpts' : config.development.databaseOpts
            };
        }
    }
};

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
