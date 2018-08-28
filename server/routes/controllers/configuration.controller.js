var parse = require('../../scripts/parseExcel.js');
var parseCommands = require('../../scripts/parseCommands.js');
var Config = require('../../model/configuration');

module.exports = {
	uploadFile : function(req, res){
		parse(req,res);
		// parseCommands(req,res);
		res.json({error_code:0,err_desc:null});
	},

	getConfig : function(req,res){
        Config.find({}, { source : 1, mission : 1 }, function(err, config) {
            if (err) {
                console.log("Error finding configurations in DB: " + err);
                // throw err;
            }
            if(config) {
                res.send(config);
            }
        });
    },

    removeConfig : function(req,res){
        var sourceIp = req.body.sourceIp;

        Config.findOne({ 'source.ipaddress' : sourceIp }, function(err, config) {
            if (err) {
                console.log("Error finding configuration: " + err);
                //throw err;
            }

            if(config){
                config.remove();
                res.status(200).send('Configuration deleted successfully');
            }
        });
    }
}
