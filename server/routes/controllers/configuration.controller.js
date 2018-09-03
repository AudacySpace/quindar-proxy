var parse = require('../../scripts/parseExcel.js');
var parseCommands = require('../../scripts/parseCommands.js');
var Config = require('../../model/configuration');

module.exports = {
	uploadFile : function(req, res){
		parse(req,res,function(status, message){
            if(status == 1){
                res.json({ status : "error" , message : message });
            } else if(status == 0){
                res.json({ status : "ok" , message : message, result : null });
            }
        });
		// parseCommands(req,res);
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
                res.json({'message' : 'Configuration deleted successfully'});
            }
        });
    }
}
