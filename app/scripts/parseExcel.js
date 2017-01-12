/*This function is used to parse the configuration excel files and load it into the 
database (collection name is "configurations")
*/

module.exports = function(req,res){

	var xlsxj = require("xlsx-to-json");
	var filepath = req.file.path;
	var Config = require('../model/configuration');

	try { 
		xlsxj({
			input: filepath, 
			output: null
		}, function(err, result) {
			if(err) {
				console.log("Excel conversion error for " + filepath + " : " + err);
		    } else {
		    	var telemetryConfig = new Object();
		    	for (i=0; i<result.length; i++) {
					telemetryConfig[result[i].id] = result[i];
				}

				Config.findOne({ 'source.ipaddress' : req.body.sourceip }, function(err, config) {
                    if (err)
                        console.log("Error finding configurations in DB: " + err);

                    if (config) {
                    	// if there is an existing configuration for source, update it
                    	config.contents = telemetryConfig;
                    	config.source.name = req.body.sourcename;

                    	config.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Configuration data updated successfully for ' + req.body.sourceip);
		  				});                       
                    } else {
                    	var newConfig = new Config();
			  			newConfig.source.name = req.body.sourcename;
			  			newConfig.contents = telemetryConfig;
			  			newConfig.source.ipaddress = req.body.sourceip;

			  			newConfig.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Configuration data saved successfully for ' + req.body.sourceip);
		  				});
                    }
                });
			}
		});
	} catch(e) {
		console.log("Corrupted excel file at : " + filepath);
	}

};
