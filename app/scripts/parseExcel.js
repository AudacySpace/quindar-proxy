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
				console.error("Excel conversion error for " + filepath + " : " + err);
		    } else {
		    	var telemetryConfig = new Object();
		    	for (i=0; i<result.length; i++) {
					telemetryConfig[result[i].id] = result[i];
				}

				//var filename = filepath.substring(filepath.lastIndexOf('/')+1).split('.')[0];

				Config.findOne({ 'source' : req.body.sourcename }, function(err, config) {
                    if (err)
                        console.log("Error finding configurations in DB: " + err);

                    if (config) {
                    	// if there is an existing configuration for source, update it
                    	config.contents = telemetryConfig;

                    	config.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Configuration data updated successfully for ' + req.body.sourcename);
		  				});                       
                    } else {
                    	var newConfig = new Config();
			  			newConfig.source = req.body.sourcename;
			  			newConfig.contents = telemetryConfig;

			  			newConfig.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Configuration data saved successfully for ' + req.body.sourcename);
		  				});
                    }
                });
			}
		});
	} catch(e) {
		console.error("Corrupted excel file at : " + filepath);
	}

	res.redirect('/public/html/sources.html');
	res.end();
};
