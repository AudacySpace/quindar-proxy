/*This function is used to parse the configuration excel files and load it into the 
database (collection name is "configurations")
*/

module.exports = function(req,res,cb){

	var xlsxj = require("xlsx-to-json-lc");
	var filepath = req.file.path;
	var Config = require('../model/configuration');
	var validHeaders = [ 'description', 'qid', 'alarm_low', 'warn_low', 'warn_high', 'alarm_high', 'expression', 'units', 'datatype' ];

	try { 
		xlsxj({
			input: filepath, 
			output: null
		}, function(err, result) {
			if(err) {
				cb(1, "Excel conversion error for " + filepath + " : " + err);
		    } else {
				//In case of no headers present
				if(result.length == 0){
					return cb(1, "Invalid File");
				}

				var headers = Object.keys(result[0]);
				var headerLength = headers.length;

				if(result.length == 1 && headerLength == 0 ){
					return cb(1, "Invalid File: File is Empty");
				} else if(headerLength != 9) {
					return cb(1, "Invalid File: File does not contain 9 different columns/headers.");
				}

				//check for valid column names
				if(headerLength == 9){
					for(var i=0; i<headers.length; i++) {
						if(validHeaders.includes(headers[i].toLowerCase())){
							continue;
						} else {
							return cb(1, "Invalid File: File does not contain valid column/header names.");
						}
					};
				}

				var telemetryConfig = new Object();
				for (i=0; i<result.length; i++) {
					var keys = Object.keys(result[i])
					var result_lc = new Object();
					//Convert all the keys to lowercase
					for(j=0; j<keys.length; j++){
						var key = keys[j];
						result_lc[key.toLowerCase()] = result[i][key];
					}
					//qid should not be empty
					if(!result_lc.qid){
						return cb(1, "Invalid File: qid values are not valid");
					}

					telemetryConfig[result_lc.qid] = result_lc;
				}

				Config.findOne({ 'source.ipaddress' : req.body.sourceip }, function(err, config) {
                    if (err)
                        return cb(1, "Error finding configurations in DB: " + err);

                    if (config) {
                    	// if there is an existing configuration for source, update it
                    	config.contents = telemetryConfig;
                    	config.source.name = req.body.sourcename;
                    	config.source.filename = req.file.originalname;
                    	config.mission = req.body.mission;
						config.simulated = req.body.simulated;

                    	config.save(function(err) {
							if (err) {
								return cb(1, "Error saving configuration file for " + req.body.sourceip);
							}
							cb(0, 'Configuration data updated successfully for ' + req.body.sourceip);
						});
                    } else {
                    	var newConfig = new Config();
			  			newConfig.source.name = req.body.sourcename;
			  			newConfig.contents = telemetryConfig;
			  			newConfig.source.ipaddress = req.body.sourceip;
			  			newConfig.source.filename = req.file.originalname;
			  			newConfig.mission = req.body.mission;
						newConfig.simulated = req.body.simulated;

						newConfig.save(function(err) {
							if (err) {
								return cb(1, "Error saving configuration file for " + req.body.sourceip);
							}

							cb(0, 'Configuration data saved successfully for ' + req.body.sourceip);
		  				});
					}
                });
			}
		});
	} catch(e) {
		return cb(1, "Corrupted excel file at : " + filepath);
	}

};
