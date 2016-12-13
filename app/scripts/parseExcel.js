module.exports = function(app){

	var xlsxj = require("xlsx-to-json");
	var fs = require('fs');

	function exceltojson(callback){ 
		xlsxj({
		    input: "./app/uploads/AudacyExample1.xlsx", 
		    output: null
		  }, function(err, result) {
		    if(err) {
		      console.error(err);
		    }else {
		      return callback(result);
		    }
		  });
	};

	exceltojson(function(response){
		var telemetryConfig = new Object();
		for (i=0; i<response.length; i++) {
			telemetryConfig[response[i].id] = response[i];
		}

		fs.writeFile("./config/telemetryConfig.js", "module.exports = \n" + JSON.stringify(telemetryConfig, null, 4) + "\n" , function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The config file was saved!");
		}); 

	});

};
