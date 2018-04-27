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
		});

		socket.on('disconnect', function(){
			for(var client in clients){
		        if(clients[client]["socket"] == socket.id){
					delete clients[client];
		        }
		    }
		});

		//poll database for new commands and send them to satellite/simulator
		setInterval(function() {
			Command.find( {'sent_to_satellite': false}, function(err, commands) {
	            if(err){
	                console.log(err);
	            }

	            if(commands) {
		            if(commands.length>0) {
						for(var i=0; i<commands.length; i++){
							newcommand.name = commands[i].name.toLowerCase();
							newcommand.argument = commands[i].argument.toLowerCase();
							newcommand.type = commands[i].type.toLowerCase();
							newcommand.timestamp = commands[i].timestamp;

							if(clients[commands[i].mission]) {
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
		            }
		        }
	        });
		}, 1000);

		socket.on('comm-ack', function(data){
			Command.findOne( {'timestamp': data.timestamp}, function(err, command) {
	            if(err){
	                console.log(err);
	            }

	            if(command) {
					command.response = data.response;

					command.save(function(err,result){
						if(err){
							console.log(err);
						}

						console.log("Response added for the command");
					})
				}
			})
		});

		socket.on('satData', function(data){
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
				//Assuming all the raw values are hexadecimal and the timestamp
				//values are unix epoch timestamp in seconds
				function(configuration, callback) {
					if(configuration){
						var newTelemetry = new Telemetry();
						newTelemetry['mission'] = parsedData['mission'];
						newTelemetry['source'] = configuration.source.name;
						newTelemetry['timestamp'] = new Date(parsedData['timestamp'] * 1000);
						var telemetry = new Object();

						for (var point in parsedData['data']) {
							//create new object for each configuration data point
							telemetry[point] = new Object();
							telemetry[point].rawValue = parsedData['data'][point];

							//convert parsedData['data'][point] from hex to decimal
							parsedData['data'][point] = convertHex(parsedData['data'][point], configuration.contents[point].datatype, configuration.contents[point].bits);
							//parsedData['data'][point] = parsedData['data'][point];
						}

						for (var point in parsedData['data']) {
							telemetry[point].notes = configuration.contents[point].description;
							telemetry[point].units = configuration.contents[point].units;

							if(configuration.contents[point].datatype == "timestamp"){
								try {
									parsedData['data'][point] = unix2Date(parsedData['data'][point]);
									telemetry[point].alarm_low = unix2Date(configuration.contents[point].alarm_low);
									telemetry[point].alarm_high = unix2Date(configuration.contents[point].alarm_high);
									telemetry[point].warn_low = unix2Date(configuration.contents[point].warn_low);
									telemetry[point].warn_high = unix2Date(configuration.contents[point].warn_high);
								} catch (e) {
									console.log("Error converting unix date: " + e);
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

//convert hexadecimal values to decimal(signed or unsigned)
function convertHex(a, type, bit) {
	if(type == "raw"){
		return a;
	} else {
		if(type == "signed"){
			a = signedHexToDec(a, bit);
		} else if(type == "binary"){
			//convert to binary
			a = hexToBin(a);
		} else if(type == "float"){
			//convert to float
			a = hexToFloat(a);
		} else {
			//unsigned and timestamp datatypes
			a = parseInt(a, 16);
		}
	}
	return a;
}

//convert unix timestamp to javascript date
function unix2Date(value) {
	if(value != ""){
		value = new Date (value * 1000);
	}
	return value;
}

//convert hexadecimal intergers to decimal
function signedHexToDec(str, bit){
	a = parseInt(str, 16);
	if(bit == 16) {
		if ((a & 0x8000) > 0) {
			a = a - 0x10000;
		}
	} else if(bit == 32) {
		if ((a & 0x80000000) < 0) {
			a = a - 0x100000000;
		}
	}
	return a;
}

//convert IEEE754 hex value to float
function hexToFloat(str) {
	var float = 0, sign, mantissa, exp,
		int = 0;
  	int = parseInt(str,16);
  	sign = (int>>>31)?-1:1;
  	exp = (int >>> 23 & 0xff) - 127;
  	mantissa = ((int & 0x7fffff) + 0x800000).toString(2);

  	for (i=0; i<mantissa.length; i+=1){
    	float += parseInt(mantissa[i])? Math.pow(2,exp):0;
    	exp--;
  	}
	return float*sign;
}

//convert hexadecimal values to binary
function hexToBin(a) {
	a = parseInt(str, 16);
	a = a.toString(2);
	return a;
}

