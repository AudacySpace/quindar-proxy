module.exports = function(socket) {

	var math = require('mathjs');
	var async = require('async');
	var julian = require('julian');
	var Config = require('../model/configuration');
	var Telemetry = require('../model/telemetry');
	var Helper = require('./helper.js');
	// var Command = require('../model/command');
	var source = "";
	var configuration = new Config();


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
					var newTelemetry = new Object();
					newTelemetry['mission'] = parsedData['mission'];
					newTelemetry['source'] = configuration.source.name;
					newTelemetry['timestamp'] = julian.toDate(parsedData['timestamp']);
					var telemetry = new Object();

					for (var point in configuration.contents) {

						//create new object for each configuration data point
						telemetry[point] = new Object();
						telemetry[point].notes = configuration.contents[point].notes;
						telemetry[point].units = configuration.contents[point].units;

						if(configuration.contents[point].datatype == "date"){
							try {
								if(parsedData['data'][point] != ""){
									parsedData['data'][point] = julian.toDate(parsedData['data'][point]);
								}
								telemetry[point].alarm_low = julian.toDate(configuration.contents[point].alarm_low);
								telemetry[point].alarm_high = julian.toDate(configuration.contents[point].alarm_high);
								telemetry[point].warn_low = julian.toDate(configuration.contents[point].warn_low);
								telemetry[point].warn_high = julian.toDate(configuration.contents[point].warn_high);
							} catch (e) {
								console.log("Error converting julian date: " + e);
							}

						} else {
							telemetry[point].alarm_low = configuration.contents[point].alarm_low;
							telemetry[point].alarm_high = configuration.contents[point].alarm_high;
							telemetry[point].warn_low = configuration.contents[point].warn_low;
							telemetry[point].warn_high = configuration.contents[point].warn_high;
						}

						if(!configuration.contents[point].expression) {
							//value mode, store the value in the data stream as it is
							telemetry[point].value = parsedData['data'][point];
						} else {
							//expression mode,  evaluate the expression and store it
							try {
								var code = math.compile(configuration.contents[point].expression);
								telemetry[point].value = code.eval(parsedData['data']);
							} catch (e) {
								console.log("Error evaluating expressions using Mathjs: " + e)
							}
						}
							
					}

					newTelemetry['telemetry'] = Helper.convert(telemetry);

					Helper.mergeTelm(newTelemetry, function(err, response){
						if(err){
							return callback(err);
						}
						callback(null, response);
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
}
