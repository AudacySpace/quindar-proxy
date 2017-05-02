//Proxy application reporting proxy status to the database as unix timestamp
var mongoose = require('mongoose');
module.exports = function() {
	timer = setInterval(function(){
		var unix = Math.round(+new Date()/1000);
		mongoose.connection.collection('proxystatus').insert({proxyapptimestamp:unix});
	}, 1000);
}