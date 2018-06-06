var mongoose = require('mongoose');

// define the schema for our user model
var commandTypeSchema = mongoose.Schema({

	mission : {
		type : String,
		required: true
	},
	commands : {
		type : Object,
		required: true
	},
	source : {
		name : {
			type : String,
			required: true
		},
		ipaddress : {
			type : String,
			required: true
		},
		filename : {
			type : String,
			required: true
		}
	}

}, { collection: 'commandType' });

// create the model for configurations and expose it to our app
module.exports = mongoose.model('commandType', commandTypeSchema);
