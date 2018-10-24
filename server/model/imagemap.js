var mongoose = require('mongoose');

// define the schema for our imagemaps model
var imagemapSchema = mongoose.Schema({
	mission : {
		type : String,
		required: true
	},
    //need to look into how this array is being used
	uploadedfiles : {
		type : Array
    }
});

// create the model for configurations and expose it to our app
module.exports = mongoose.model('imagemap', imagemapSchema);