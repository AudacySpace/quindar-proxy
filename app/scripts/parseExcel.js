/*This function is used to parse the configuration excel files and load it into the 
database (collection name is "configurations")
*/

module.exports = function(){

	var xlsxj = require("xlsx-to-json");
	var filepath = "./app/uploads/GMAT.xlsx";
	var Config = require('../model/configuration');

	try { 
		xlsxj({
			input: filepath, 
			output: null
		}, function(err, result) {
			if(err) {
				console.error("Excel conversion error for " + filepath + " : " + err);
		    } else {
		    	var telemetryConfig = new Object();
		    	for (i=0; i<result.length; i++) {
					telemetryConfig[result[i].id] = result[i];
				}

				var filename = filepath.substring(filepath.lastIndexOf('/')+1).split('.')[0];

				Config.findOne({ 'source' : filename }, function(err, config) {
                    if (err)
                        console.log("Error finding configurations in DB: " + err);

                    if (config) {
                    	// if there is an existing configuration for source, update it
                    	config.contents = telemetryConfig;

                    	config.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Configuration data updated successfully for ' + filename);
		  				});                       
                    } else {
                    	var newConfig = new Config();
			  			newConfig.source = filename;
			  			newConfig.contents = telemetryConfig;

			  			newConfig.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Configuration data saved successfully for ' + filename);
		  				});
                    }
                });
			}
		});
	} catch(e) {
		console.log("Corrupted excel file at : " + filepath);
	}

};
