module.exports = function(io, julian, async) {

	var Config = require('../model/configuration');
	var position = require('../model/position');
	var source = "";
	var configuration = new Config();

	//Listen to the GMAT server streaming data
	io.on('connection', function(socket){
		console.log('socket.io server connected.');

		socket.on('satData1', function(data){
			try {
			    var parsedData = JSON.parse(data);
			} catch (e) {
			    console.log("Data is not JSON format");
			    throw e;
			}

			async.waterfall([
				//Load the configuration from database
				function(callback) {
					//Source of the data stream is identified using vehicleID
					if (parsedData.vehicleId == "Audacy1") {
						source = "GMAT";
						if ( configuration.source != source ) {
							Config.findOne({ 'source' : source }, function(err, config) {
			                    if (err) {
			                        console.log("Error finding configurations in DB: " + err);
			                    	//throw err;
			                    	return callback(err);
			                    }

			                    if (config) {
			                    	// if there is an existing configuration for source, update it
			                    	configuration.contents = config.contents;
			                    	configuration.source = source;
			                    	console.log("Loaded configuration for " + source);
			                    	callback(null, configuration);
			                      
			                    } else {
			                    	console.log("There is no defined configuration for " + source);
			                    	callback(null, false);
			                    }
			                });
						} else {
							callback(null, configuration);
						}
					} else {
						callback(null, false);
					}
				},

				//Format the datastream as per configuration, if present
				function(configuration, callback) {
					if(configuration.source){
						var newPosition = new position();			

						for (var point in configuration.contents) {

							newPosition[point].notes = configuration.contents[point].notes;
							newPosition[point].category = configuration.contents[point].category;
							newPosition[point].name = configuration.contents[point].name;
							newPosition[point].units = configuration.contents[point].units;

							if(configuration.contents[point].datatype == "date"){
								try {
									parsedData[point] = julian.toDate(parsedData[point]);
									newPosition[point].alarm_low = julian.toDate(configuration.contents[point].alarm_low);
									newPosition[point].alarm_high = julian.toDate(configuration.contents[point].alarm_high);
									newPosition[point].warn_low = julian.toDate(configuration.contents[point].warn_low);
									newPosition[point].warn_high = julian.toDate(configuration.contents[point].warn_high);
								} catch (e) {
									console.log("Error converting julian date: " + e);
								}

							} else {
								newPosition[point].alarm_low = configuration.contents[point].alarm_low;
								newPosition[point].alarm_high = configuration.contents[point].alarm_high;
								newPosition[point].warn_low = configuration.contents[point].warn_low;
								newPosition[point].warn_high = configuration.contents[point].warn_high;
							}

							if(!configuration.contents[point].value) {
								newPosition[point].value = parsedData[point];
							} else {
								newPosition[point].value = null;
							}
							
						}
						
						newPosition.save(function(err) { 
							if (err) {
								return callback(err);
							}

							callback(null, 'Data saved successfully!');
						});
					} else {
						callback(null, 'No configuration set for this data stream');
					}
				}
			], function (err, result) {
				if(err) throw err;

				console.log(result);
			});		

		});

	});
}