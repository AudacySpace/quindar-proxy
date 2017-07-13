//Proxy application reporting proxy status to the database as unix timestamp
module.exports = function() {
	var ProxyStatus = require('../model/proxystatus');

	ProxyStatus.findOne({}, function(err, status) {
		if (err)
			console.log("Error finding proxy status in DB: " + err);

        if (status) {
        	//update time if document exists
        	timer = setInterval(function(){
        		var timestamp = Math.round(+new Date()/1000);
        		status.proxytimestamp =  timestamp;

				status.save(function(err){
					if(err){
						console.log(err);
					}
				});
			}, 1000);
        }
        else {
        	//create a new document if not document exists
        	var newStatus = new ProxyStatus();
        	timer = setInterval(function(){
        		var timestamp = Math.round(+new Date()/1000);
        		newStatus.proxytimestamp =  timestamp;

				newStatus.save(function(err){
					if(err){
						console.log(err);
					}
				});
			}, 1000);
        }
    });
}