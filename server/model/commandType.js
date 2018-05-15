var mongoose = require('mongoose');

// define the schema for our user model
var commandTypeSchema = mongoose.Schema({

    mission : String,
    commands : Object,
    source : {
    	name : String,
    	ipaddress : String,
    	filename :  String
    }

}, { collection: 'commandType' });

// create the model for configurations and expose it to our app
module.exports = mongoose.model('commandType', commandTypeSchema);
