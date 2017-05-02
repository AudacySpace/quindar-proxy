module.exports = function(io, julian, async) {

	var math = require('mathjs');
	var Config = require('../model/configuration');
	var Telemetry = require('../model/telemetry');
	var source = "";
	var configuration = new Config();

	//Listen to the GMAT server streaming data
	io.on('connection', function(socket){
		console.log('socket.io server connected.');

		socket.on('satData1', function(data){
			source = socket.handshake.headers['x-real-ip'];

			try {
			    var parsedData = JSON.parse(data);
			} catch (e) {
			    console.log("Data is not JSON format");
			    throw e;
			}

			async.waterfall([
				//Load the configuration from database
				function(callback) {

					Config.findOne({ 'source.ipaddress' : source }, function(err, config) {
						if (err) {
			                console.log("Error finding configurations in DB: " + err);
			                return callback(err);
			            }

			            if (config) {
			                // if there is an existing configuration for source, update it
			                configuration.contents = config.contents;
		                    configuration.source.name = config.source.name;
		                    configuration.source.ipaddress = source;
		                    console.log("Loaded configuration for " + source);
		                    callback(null, configuration);

		                } else {
		                    console.log("There is no defined configuration for " + source);
		                    callback(null, false);
		                }
		            });
				},

				//Format the datastream as per configuration, if present
				function(configuration, callback) {
					if(configuration){
						var newTelementry = new Telemetry();			

						for (var point in configuration.contents) {

							newTelementry[point].notes = configuration.contents[point].notes;
							newTelementry[point].category = configuration.contents[point].category;
							newTelementry[point].name = configuration.contents[point].name;
							newTelementry[point].units = configuration.contents[point].units;

							if(configuration.contents[point].datatype == "date"){
								try {
									parsedData[point] = julian.toDate(parsedData[point]);
									newTelementry[point].alarm_low = julian.toDate(configuration.contents[point].alarm_low);
									newTelementry[point].alarm_high = julian.toDate(configuration.contents[point].alarm_high);
									newTelementry[point].warn_low = julian.toDate(configuration.contents[point].warn_low);
									newTelementry[point].warn_high = julian.toDate(configuration.contents[point].warn_high);
								} catch (e) {
									console.log("Error converting julian date: " + e);
								}

							} else {
								newTelementry[point].alarm_low = configuration.contents[point].alarm_low;
								newTelementry[point].alarm_high = configuration.contents[point].alarm_high;
								newTelementry[point].warn_low = configuration.contents[point].warn_low;
								newTelementry[point].warn_high = configuration.contents[point].warn_high;
							}

							if(!configuration.contents[point].value) {
								//value mode, store the value in the data stream as it is
								newTelementry[point].value = parsedData[point];
							} else {
								//expression mode,  evaluate the expression and store it
								try {
									var code = math.compile(configuration.contents[point].value);
									newTelementry[point].value = code.eval(parsedData);
								} catch (e) {
									console.log("Error evaluating expressions using Mathjs: " + e)
								}
							}
							
						}
						
						newTelementry.save(function(err) { 
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