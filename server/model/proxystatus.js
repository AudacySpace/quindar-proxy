var mongoose = require('mongoose');

// define the schema for our user model
var proxyStatusSchema = mongoose.Schema({
	proxytimestamp : {
		type : Number,
		required: true
	}
});

// create the model for proxystatus and expose it to our app
module.exports = mongoose.model('Status', proxyStatusSchema);