var csv = require('csvtojson');
var Config = require('../../model/configuration');

module.exports = {
	saveFile : function(req, res){
			try {
                var csvFilePath = req.file.path;
                var beaconId = parseInt(req.body.id);
                var sourceip = req.body.sourceip;
                var convertedObj = {};

                csv().fromFile(csvFilePath).then(function(jsonObj){
                    //check if the file has both Parameter and Bits property for each row
                    var parameterCount = 0;
                    for(var a=0;a<jsonObj.length;a++){
                        if(Object.keys(jsonObj[a]).length >= 2){ // check if the file has atleast 2 parameters 
                            parameterCount++;
                        }
                    }

                    if(parameterCount !== jsonObj.length){ 
                        res.json({error_code:1,error_desc:"Does not have all the rows data"});
                    } else {
                        var convertedObj = checkBitType(jsonObj);
                        if (!convertedObj) {
                            res.json({error_code:1,error_desc:"Bits column has non numeric data"});
                        } else {
                            // combine csv header row and csv line to a json object
                            Config.findOne({'source.ipaddress' : sourceip }, function(err, config) {
                                if (err) {
                                    console.log("Error finding configuration: " + err);
                                    throw err;
                                }

                                if(config) {
                                    var attachmentId = "";
                                    for(var i=0;i<config.attachments.length;i++){
                                        if(config.attachments[i].id === beaconId){
                                            attachmentId = i;
                                            break;
                                        }
                                    }

                                    if(attachmentId !== ""){
                                        // update the aggregator file
                                        var newjsonArray = convertedObj;
                                        config.attachments[attachmentId].data = newjsonArray;
                                        config.attachments[attachmentId].filename = req.file.originalname;
                                        config.markModified('attachments');

                                        config.save(function(err) {
                                        if (err) throw err;
                                            console.log(' Attachment data updated successfully.');
                                        });
                                        res.json({error_code:0,error_desc:"update"});

                                    }else {
                                        //push to attachments array
                                        //each attachment will have an id,filename,data
                                        var newattachment = {
                                            id:"",
                                            filename:"",
                                            data:[]
                                        };

                                        newattachment.id = beaconId;
                                        newattachment.filename = req.file.originalname;
                                        var newjsonArray = convertedObj;
                                        newattachment.data = newjsonArray;
                                        config.attachments.push(newattachment);

                                        config.save(function(err) {
                                        if (err) throw err;
                                            console.log(' Attachment data added successfully.');
                                        });
                                        res.json({error_code:0,error_desc:"add"});
                                    }
                                }
                            });
                        }
                    }  
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corrupted csv file"});
            }
	},

	getAttachments : function(req,res){
        var sourceip = req.query.sourceip;
        Config.findOne({'source.ipaddress' : sourceip}, function(err, config) {
            if (err) {
                console.log("Error finding configurations in DB: " + err);
                throw err;
            }

            if(config){
                res.send(config.attachments);
            }            
        });
    },

    removeAttachment : function(req,res){
        var beaconId = req.body.id;
        var sourceip = req.body.sourceip;

        Config.findOne({'source.ipaddress' : sourceip}, function(err, config) {
            if (err) {
                console.log("Error finding configuration in DB: " + err);
                throw err;
            }
            if(config){
                for(var i=0;i<config.attachments.length;i++){
                    if(config.attachments[i].id === beaconId){
                        config.attachments.splice(i,1);
                    }
                }
                config.markModified('attachments');
                config.save(function(err) {
                    if (err) throw err;
                    console.log(' The attachment with Id:' + beaconId +' for '+ 'is deleted.');
                }); 
                res.json({error_code:0,err_desc:null});
            }
        });
    }
}


//False if the "Bits" column has non number values, else convert Bits to numeric
function checkBitType(jsonObj){
    var numbers = /^[0-9]+$/;
    for(var i=0; i<jsonObj.length; i++){
        var bits = jsonObj[i].Bits;
        if(!bits.match(numbers)){
            return false;
        }
        jsonObj[i].Bits = parseInt(jsonObj[i].Bits);
    }
    return jsonObj;
}