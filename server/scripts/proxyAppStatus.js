
//Proxy application reporting proxy status to the database as unix timestamp
var mongoose = require('mongoose');
module.exports = function() {
	var ProxyStatus = require('../model/proxystatus');
	var appStatus = new ProxyStatus();
	timer = setInterval(function(){
		var unix = Math.round(+new Date()/1000);
		appStatus.timestamp =  unix;
		appStatus.save(function(err){
			if(err){
				console.log(err);
			}
		});
	  }, 1000);
}