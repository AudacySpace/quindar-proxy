module.exports = function(io, async) {

	//var math = require('mathjs');
	var Config = require('../model/configuration');
	var Telemetry = require('../model/telemetry');
	//var Command = require('../model/command');
	var source = "";
	var configuration = new Config();
	//var newcommand = {};
	var clients = {};

	//Listen to the Gateway server streaming data
	io.on('connection', function(socket){
		console.log('socket.io server connected.');

		//add clients socket id using mission name
		socket.on('add-mission', function(data){
			clients[data.mission] = {
				"socket" : socket.id
			}
		});

		socket.on('disconnect', function(){
			for(var client in clients){
		        if(clients[client]["socket"] == socket.id){
					delete clients[client];
		        }
		    }
		});

		socket.on('zeroData', function(data){
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
					// source = "10.0.0.100"
					// parsedData= {
					// 	'id' : 1, 
					// 	'data' : '111100000000101010101011100010010101011010101010101010100111110000000'
					// };
					Config.findOne({ 'source.ipaddress' : source, 'attachments.id' : parsedData['id'] }, 
						{ 'source' : 1, 'contents': 1, 'attachments.$': 1 }, function(err, config) {
						if (err) {
			                console.log("Error finding configurations in DB: " + err);
			                return callback(err);
			            }

			            if (config) {
			                // if there is an existing configuration for source, update it
			                configuration.contents = config.contents;
		                    configuration.source.name = config.source.name;
		                    configuration.source.ipaddress = source;
		                    configuration.attachments = config.attachments;
		                    // console.log("Loaded configuration for " + source);
		                    // console.log(config);
		                    // console.log(config.attachments);
		                    callback(null, configuration);

		                } else {
		                    console.log("There is no defined configuration for " + source);
		                    callback(null, false);
		                }
		            });
				},

				//Divide the bit stream as per identified beacon
				function(configuration, callback) {
					if(configuration.attachments[0]){
						var agg = configuration.attachments[0];
						var bitStream = parsedData['data'];

						var aggObj = new Object();
						for (var i=0; i<agg.contents.length; i++){
						  var id = bitStream.substr(0, agg.contents[i].length);
						  bitStream = bitStream.substr(agg.contents[i].length);
						  aggObj[agg.contents[i].name] = id;
						}

						parsedData['data'] = aggObj;

	// 					var newTelemetry = new Telemetry();
	// 					newTelemetry['mission'] = parsedData['mission'];
	// 					newTelemetry['source'] = configuration.source.name;
	// 					newTelemetry['timestamp'] = new Date(parsedData['timestamp'] * 1000);
	// 					var telemetry = new Object();

	// 					for (var point in parsedData['data']) {
	// 						//create new object for each configuration data point
	// 						telemetry[point] = new Object();
	// 						telemetry[point].rawValue = parsedData['data'][point];

	// 						//convert parsedData['data'][point] from hex to decimal
	// 						parsedData['data'][point] = convertHex(parsedData['data'][point], configuration.contents[point].datatype, configuration.contents[point].bits);
	// 						//parsedData['data'][point] = parsedData['data'][point];
	// 					}

	// 					for (var point in parsedData['data']) {
	// 						telemetry[point].notes = configuration.contents[point].description;
	// 						telemetry[point].units = configuration.contents[point].units;

	// 						if(configuration.contents[point].datatype == "timestamp"){
	// 							try {
	// 								parsedData['data'][point] = unix2Date(parsedData['data'][point]);
	// 								telemetry[point].alarm_low = unix2Date(configuration.contents[point].alarm_low);
	// 								telemetry[point].alarm_high = unix2Date(configuration.contents[point].alarm_high);
	// 								telemetry[point].warn_low = unix2Date(configuration.contents[point].warn_low);
	// 								telemetry[point].warn_high = unix2Date(configuration.contents[point].warn_high);
	// 							} catch (e) {
	// 								console.log("Error converting unix date: " + e);
	// 							}
	// 						} else {
	// 							telemetry[point].alarm_low = configuration.contents[point].alarm_low;
	// 							telemetry[point].alarm_high = configuration.contents[point].alarm_high;
	// 							telemetry[point].warn_low = configuration.contents[point].warn_low;
	// 							telemetry[point].warn_high = configuration.contents[point].warn_high;
	// 						}

	// 						if(!configuration.contents[point].expression) {
	// 							//value mode, store the value in the data stream as it is
	// 							telemetry[point].value = parsedData['data'][point];
	// 						} else {
	// 							//expression mode,  evaluate the expression and store it
	// 							try {
	// 								var code = math.compile(configuration.contents[point].expression);
	// 								telemetry[point].value = code.eval(parsedData['data']);
	// 							} catch (e) {
	// 								console.log("Error evaluating expressions using Mathjs: " + e)
	// 							}
	// 						}
							
	// 					}

	// 					newTelemetry['telemetry'] = convert(telemetry);
						
	// 					newTelemetry.save(function(err) { 
	// 						if (err) {
	// 							return callback(err);
	// 						}

	// 						callback(null, 'Data saved successfully!');
	// 					});
						callback(null, 'Data saved successfully!');
					} 
					// else {
	// 					callback(null, 'No configuration set for this data stream');
	// 				}
				}
			], function (err, result) {
				if(err) throw err;

				console.log(result);
			});		

		});

	});
}