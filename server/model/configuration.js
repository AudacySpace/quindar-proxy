var mongoose = require('mongoose');

// define the schema for our user model
var configSchema = mongoose.Schema({
	source : {
		name : {
			type : String,
			required: true
		},
		ipaddress : {
			type : String,
			required: true
		},
		filename :  {
			type : String,
			required: true
		}
    },
	contents : {
		type : Object
	},
	mission : {
		type : String,
		required: true
	},
	simulated : {
		type : Boolean,
		required : true
	},
	attachments : {
		type : Array
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('configuration', configSchema);
