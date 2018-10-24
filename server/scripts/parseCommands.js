/*This function is used to parse the "Commands" sheet of configuration excel files 
and load it into the database (collection name is "commandType")
*/

module.exports = function(req,res){

	var xlsxj = require("xlsx-to-json-lc");
	var filepath = req.file.path;
	var Command = require('../model/commandType');

	try { 
		xlsxj({
			input: filepath, 
			output: null,
			sheet: "Commands"
		}, function(err, result) {
			if(err) {
				console.log("Excel conversion error for " + filepath + " : " + err);
		    } else {
		    	var types = result;

				Command.findOne({ 'source.ipaddress' : req.body.sourceip }, function(err, command) {
                    if (err)
                        console.log("Error finding command types in DB: " + err);

                    if (command) {
                    	// if there is an existing configuration for source, update it
                    	command.commands = types;
                    	command.source.name = req.body.sourcename;
                    	command.source.filename = req.file.originalname;
                    	command.mission = req.body.mission;

                    	command.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Command data updated successfully for ' + req.body.sourceip);
		  				});                       
                    } else {
                    	var newCommand = new Command();
			  			newCommand.source.name = req.body.sourcename;
			  			newCommand.commands = types;
			  			newCommand.source.ipaddress = req.body.sourceip;
			  			newCommand.source.filename = req.file.originalname;
			  			newCommand.mission = req.body.mission;

			  			newCommand.save(function(err) {
		  					if (err) throw err;
		  		
		  					console.log('Command data saved successfully for ' + req.body.sourceip);
		  				});
                    }
                });
			}
		});
	} catch(e) {
		console.log("Corrupted excel file at : " + filepath);
	}

};
