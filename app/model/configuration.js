var mongoose = require('mongoose');

// define the schema for our user model
var configSchema = mongoose.Schema({

    source : String,
    contents : Object

});

// create the model for users and expose it to our app
module.exports = mongoose.model('configuration', configSchema);
