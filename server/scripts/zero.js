//mission library for Audacy Zero
module.exports = function(socket) {

	var math = require('mathjs');
	var async = require('async');
	var Config = require('../model/configuration');
	var Telemetry = require('../model/telemetry');
	var Helper = require('./helper.js');

	var source = "";
	var configuration = new Config();

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
				//test data when no socket connection
				// source = "10.0.0.100";
				// parsedData= {
				// 	'metadata' : {
				// 		'id' : 5
				// 	},
				// 	'data' : '1011111110001100110011001100110111000101010110001000000011000101010110000000110001111011110001010101100010110110000010010101001000110001111111111111111111111111111111111111111',
				// 	'timestamp' : '1527032088',
				// 	'mission' : 'Test'
				// };
				if(parsedData.hasOwnProperty("metadata")){
					var metadata = parsedData["metadata"];
					if(metadata.hasOwnProperty("id")){
						Config.findOne({ 'source.ipaddress' : source, 'attachments.id' : metadata['id'] },
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
				                console.log("Loaded configuration for " + source);
				                callback(null, configuration);

				            } else {
				                console.log("There is no defined configuration for " + source);
				                callback(null, false);
				            }
				        });
					} else {
						console.log("The property id does not exist in metadata for " + source);
				        callback(null, false);
					}
				} else {
					console.log("The property metadata does not exist in data for " + source);
					callback(null, false);
				}
			},

			//Divide the bit stream as per identified beacon
			function(configuration, callback) {
				if(configuration.attachments !== undefined){
					var agg = configuration.attachments[0];
					var bitStream = parsedData['data'];

					var aggObj = new Object();
					for (var i=0; i<agg.data.length; i++){
						var paramValue = bitStream.substr(0, agg.data[i].Bits);
						bitStream = bitStream.substr(agg.data[i].Bits);
						aggObj[agg.data[i].Parameter] = paramValue;
					}

					parsedData['data'] = aggObj;

					var newTelemetry = new Object();
					newTelemetry['mission'] = parsedData['mission'];
					newTelemetry['source'] = configuration.source.name;
					newTelemetry['timestamp'] = new Date(parsedData['timestamp'] * 1000);
					var telemetry = new Object();

					for (var point in parsedData['data']) {
						//create new object for each configuration data point
						telemetry[point] = new Object();
						telemetry[point].rawValue = parsedData['data'][point];

						//convert parsedData['data'][point] from hex to decimal
						parsedData['data'][point] = convertType(parsedData['data'][point], configuration.contents[point].datatype);
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

						if(configuration.contents[point].expression) {
							var datatype = configuration.contents[point].datatype;
							if(datatype == "timestamp" || datatype == "raw" || datatype == "hex") {
								//for these datatypes, store the value in the data stream as it is
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
						} else {
							//value mode, store the value in the data stream as it is
							telemetry[point].value = parsedData['data'][point];
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

//convert hexadecimal values to decimal(signed or unsigned)
function convertType(a, type) {
	var notBinary = /[^01]/;
	if(notBinary.test(a)){
		return a;
	} else {
		if(type == "raw"){
			return a;
		} else {
			if(type == "signed16"){
				a = signedBinToDec(a, 16);
			} else if(type == "signed32"){
				a = signedBinToDec(a, 32);
			} else if(type == "hex"){
				//convert to binary
				a = bin2Hex(a);
			} else if(type == "float"){
				//convert to float
				a = binToFloat(a);
			} else {
				//unsigned and timestamp datatypes
				a = parseInt(a, 2);
			}
			return a;
		}
	}
}

//convert unix timestamp to javascript date
function unix2Date(value) {
	if(value != ""){
		value = new Date (value * 1000);
	}
	return value;
}

//convert hexadecimal intergers to decimal
function signedBinToDec(str, bit){
	a = parseInt(str, 2);
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

//convert IEEE754 bin value to float
function binToFloat(str) {
	var float = 0, sign, mantissa, exp,
		int = 0;
	int = parseInt(str,2);
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
function bin2Hex(a) {
	a = parseInt(a, 2);
	a = a.toString(16);
	return a;
}
