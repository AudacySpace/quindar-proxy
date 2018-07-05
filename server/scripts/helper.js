module.exports = {
	
	//merge the current telemetry object with latest telemetry document in database
    mergeTelm: function(newTelemetry, callback) {
    	var merge = require('deepmerge');
    	var Telemetry = require('../model/telemetry');
    	var tempTelemetry = {};
        
        Telemetry.findOne(
        	{'mission' : newTelemetry['mission'] },
        	{'_id': 0, '__v': 0},
        	{ sort: { 'timestamp' : -1 } },
        	function(err, telemetry) {
        		if(err){
        			console.log(err);
        		};

				if(telemetry){
					tempTelemetry = merge(telemetry, newTelemetry);
				} else {
					tempTelemetry = newTelemetry;
				}

				var mergedTelemetry = new Telemetry();
				mergedTelemetry['mission'] = tempTelemetry.mission;
				mergedTelemetry['source'] = tempTelemetry.source;
				mergedTelemetry['timestamp'] = tempTelemetry.timestamp;
				mergedTelemetry['telemetry'] = tempTelemetry.telemetry;

				mergedTelemetry.save(function(err) { 
					if (err) {
						callback(err);
					}

					callback(null, 'Data saved successfully!');
				});
			}
		);
	},

	//Function to convert flat structure object to hierarchial structure
	convert: function(obj) {
		var result = {};
		eachKeyValue(obj, function(namespace, value) {
			var parts = namespace.split("_");
			var last = parts.pop();
			var node = result;
			parts.forEach(function(key) {
				node = node[key] = node[key] || {};
			});
			node[last] = value;
		});
		return result;
	}
}

//function returning key and value of the object as a callback function
function eachKeyValue(obj, fun) {
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			fun(i, obj[i]);
		}
	}
}