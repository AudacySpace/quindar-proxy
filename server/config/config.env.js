// Grab the config env file if it's there
var config;

try{
    config = require('./config.env');
} catch(e) {
    config = {};
}

module.exports = function(){
    if(isEmpty(config)){
        //default values if configuration not present
        return {
            'databaseURL' : 'mongodb://localhost:27017/quindar'
        };
    } else {
        //values of NODE_ENV - 'staging', 'production', 'development'
        if(process.env.NODE_ENV) {
            return {
                'databaseURL' : config[process.env.NODE_ENV].databaseURL
            };
        } else { //return values for development environment in case NODE_ENV not set
            return {
                'databaseURL' : config.development.databaseURL
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
