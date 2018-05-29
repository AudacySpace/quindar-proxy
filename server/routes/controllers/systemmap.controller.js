var Imagemap = require('../../model/imagemap');
var jsonfile = require('jsonfile');
var fs = require('fs');

module.exports = {
	getImageList : function(req,res){
        Imagemap.find({}, {}, function(err, mapdata) {
            if (err) {
                console.log("Error finding map data in DB: " + err);
                throw err;
            }

            var imagelist = [];
            for(var i=0;i<mapdata.length;i++){
                for(j=0;j<mapdata[i].uploadedfiles.length;j++){
                    imagelist.push({
                        "imageid":mapdata[i].uploadedfiles[j].imageid,
                        "mission":mapdata[i].mission,
                        "imagefile":mapdata[i].uploadedfiles[j].imagefile,
                        "contentsfile":mapdata[i].uploadedfiles[j].contentsfile
                    });
                }
            }
           res.send(imagelist); 
        });
    },

    saveImage : function(req, res) {
    	var contents = jsonfile.readFileSync(req.files.contents[0].path);
    	var img = fs.readFileSync(req.files.image[0].path);
        var imgfile = req.files.image[0].originalname;
        var contsfile = req.files.contents[0].originalname;

        for(var i=0;i<contents.length;i++){
        	if(contents[i].id === "" || contents[i].coords === {} || contents[i].coords.position === "" || contents[i].coords.top === "" || contents[i].coords.left === ""){
        		res.json({error_code:1,err_desc:"bad json"});
        		return;
        	}
        }

        Imagemap.findOne({'mission' : req.body.mission }, function(err, docmaps) {
        	if(err){
        		console.log(err);
        	}

        	if(docmaps){
        		docmaps.uploadedfiles.push({
        			"imageid" : req.body.imageid,
        			"image" : img,
        			"contents" : contents,
        			"imagefile" : imgfile,
        			"contentsfile" : contsfile
        		});

        		docmaps.markModified('uploadedfiles');
        		docmaps.save(function(err) {
        			if (err) throw err;
        			console.log(' image map data updated successfully for ' + req.body.mission);
        		});
        	}else {
        		//create a new document if not document exists
        		var imaps = new Imagemap();
        		imaps.mission =  req.body.mission;
        		imaps.uploadedfiles.push({
        			"imageid" : req.body.imageid,
        			"image" : img,
        			"contents" : contents,
        			"imagefile" : imgfile,
        			"contentsfile" : contsfile
        		})

        		imaps.save(function(err,result){
        			if(err){
        				console.log(err);
        			}
        			if(result){
        				console.log('map data saved successfully for ' + req.body.mission);
        			}
        		});
        	}
        });
		res.json({error_code:0,err_desc:null});
    },

    removeImage : function(req,res){
        var imageid = req.body.imageid;
        var mission = req.body.mission;
        Imagemap.findOne({'mission':mission}, function(err, mapdata) {
            if (err) {
                console.log("Error finding map data in DB: " + err);
                throw err;
            }
            if(mapdata){
                for(var i=0;i<mapdata.uploadedfiles.length;i++){
                    if(mapdata.uploadedfiles[i].imageid === imageid){
                        mapdata.uploadedfiles.splice(i,1);
                    }
                }

                mapdata.markModified('uploadedfiles');
                mapdata.save(function(err) {
                    if (err) throw err;
                    console.log(' The image map:' + imageid +' for ' +req.body.mission + 'is deleted.');
                }); 
            }
        });
        res.json({error_code:0,err_desc:null});
    }
}