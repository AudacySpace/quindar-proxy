var mongoose = require('mongoose');

// define the schema for our satData1 model
var satSchema = mongoose.Schema({

    timestamp : String,
    vehicleId : String, 
    vx : String, 
    vy : String, 
    vz : String, 
    x : String, 
    y : String, 
    z : String

});

// create the model for satData1 and expose it to our app
module.exports = mongoose.model('satData1', satSchema);