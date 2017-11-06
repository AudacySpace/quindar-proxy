module.exports = function(io, julian, async) {

	var math = require('mathjs');
	var Config = require('../model/configuration');
	var Telemetry = require('../model/telemetry');
	var Command = require('../model/command');
	var source = "";
	var configuration = new Config();
	var newcommand = {};
	var clients = {};

	//Listen to the GMAT server streaming data
	io.on('connection', function(socket){
		console.log('socket.io server connected.');

		//add clients socket id using mission name
		socket.on('add-mission', function(data){
			clients[data.mission] = {
				"socket" : socket.id
			}
		})

		socket.on('disconnect', function(){
			for(var client in clients){
		        if(clients[client]["socket"] == socket.id){
					delete clients[client];
		        }
		    }
		})

		//poll database for new commands and send them to satellite/simulator
		setInterval(function() {
			Command.find( {'sent_to_satellite': false}, function(err, commands) {
	            if(err){
	                console.log(err);
	            }

	            if(commands.length>0) {
					for(var i=0; i<commands.length; i++){
						newcommand.name = commands[i].name;
						newcommand.argument = commands[i].argument;
						newcommand.timestamp = julian(commands[i].timestamp);

						var room = clients[commands[i].mission]["socket"];
						if(room) {
							io.to(room).emit("command", newcommand);
							commands[i].sent_to_satellite = true;

							commands[i].save(function(err,result){
								if(err){
									console.log(err);
								}

								console.log("Flag updated for sent command");
							})
						}
		            }
	            }
	        });
		}, 1000);

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
						var newTelemetry = new Telemetry();
						newTelemetry['mission'] = parsedData['mission'];
						newTelemetry['timestamp'] = julian.toDate(parsedData['timestamp']);
						var telemetry = new Object();

						for (var point in configuration.contents) {
							//slice variable to have <platform>_<system>_<category>_<channel>
							var nodes = point.split("_").slice(2);
							var newPoint = nodes.join("_");

							//create new object for each configuration data point
							telemetry[newPoint] = new Object();
							telemetry[newPoint].notes = configuration.contents[point].notes;
							telemetry[newPoint].category = configuration.contents[point].category;
							telemetry[newPoint].name = configuration.contents[point].name;
							telemetry[newPoint].units = configuration.contents[point].units;

							if(configuration.contents[point].datatype == "date"){
								try {
									parsedData[point] = julian.toDate(parsedData[point]);
									telemetry[newPoint].alarm_low = julian.toDate(configuration.contents[point].alarm_low);
									telemetry[newPoint].alarm_high = julian.toDate(configuration.contents[point].alarm_high);
									telemetry[newPoint].warn_low = julian.toDate(configuration.contents[point].warn_low);
									telemetry[newPoint].warn_high = julian.toDate(configuration.contents[point].warn_high);
								} catch (e) {
									console.log("Error converting julian date: " + e);
								}

							} else {
								telemetry[newPoint].alarm_low = configuration.contents[point].alarm_low;
								telemetry[newPoint].alarm_high = configuration.contents[point].alarm_high;
								telemetry[newPoint].warn_low = configuration.contents[point].warn_low;
								telemetry[newPoint].warn_high = configuration.contents[point].warn_high;
							}

							if(!configuration.contents[point].expression) {
								//value mode, store the value in the data stream as it is
								telemetry[newPoint].value = parsedData['data'][point];
							} else {
								//expression mode,  evaluate the expression and store it
								try {
									var code = math.compile(configuration.contents[point].expression);
									telemetry[newPoint].value = code.eval(parsedData['data']);
								} catch (e) {
									console.log("Error evaluating expressions using Mathjs: " + e)
								}
							}
							
						}

						newTelemetry['telemetry'] = convert(telemetry);
						
						newTelemetry.save(function(err) { 
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

//Function to convert flat structure object to hierarchial structure
function convert(obj) {
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

function eachKeyValue(obj, fun) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            fun(i, obj[i]);
        }
    }
}
