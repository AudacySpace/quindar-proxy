var mongoose = require('mongoose');

// define the schema for our user model
var configSchema = mongoose.Schema({
    source : {
    	name : String,
    	ipaddress : String,
    	filename :  String
    },
    contents : Object,
    mission : String, 
    attachments : Array
});

// create the model for users and expose it to our app
module.exports = mongoose.model('configuration', configSchema);
