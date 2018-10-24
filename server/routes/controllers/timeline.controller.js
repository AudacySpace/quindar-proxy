var Timeline = require('../../model/timeline');
var XLSX = require("xlsx");

module.exports = {
    saveTimeline : function(req, res){
            try {
                var filepath = req.file.path;
                var workbook = XLSX.readFile(filepath);
                var sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
                var sheet2 = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet2);
                var newgroupContents = [];
                var d1,d2,timerange;
                var sheets = {
                    "sheet1":sheet1,
                    "sheet2":sheet2,
                    "workbook":workbook
                }

                if(sheets.sheet1.length == 0 || sheets.sheet2.length == 0){
                    return res.json({
                        status : "error",
                        message : "Invalid files: Sheet1/Sheet2 is empty"
                    });
                }

                for(var i=0;i<sheet1.length;i++){
                    newgroupContents.push({"eventname":sheet1[i].eventname,"eventdata":[],"eventgroup":sheet1[i].eventgroup,"eventinfo":sheet1[i].eventinfo}); 
                }


                for(var j=0;j<sheet1.length;j++){
                    for(var k=0;k<sheet2.length;k++){
                        for(var l=0;l<Object.keys(sheet2[k]).length;l++){
                            if(newgroupContents[j].eventname === Object.keys(sheet2[k])[l]){
                                if(sheet2[k][Object.keys(sheet2[k])[l]] !== "{}"){
                                    d1 =  sheet2[k][Object.keys(sheet2[k])[l]].replace("{", "");
                                    d2 =  d1.replace("}","");
                                    timerange = d2.split(",");
                                    newgroupContents[j].eventdata.push({
                                        "start":timerange[0],
                                        "end":timerange[1],
                                        "content":timerange[2]
                                    });
                                }else {
                                    newgroupContents[j].eventdata.push({
                                        "start":"",
                                        "end":"",
                                        "content":""
                                    });
                                }
                            }
                        }
                    }
                }

                Timeline.findOne({'mission' : req.body.mission }, function(err, docmaps) {
                    if(err){
                        return res.json({ status : "error" , message : err });
                    }

                    if(docmaps){
                        docmaps.events = newgroupContents;
                        docmaps.filename = req.body.filename;
                        docmaps.file = req.file.originalname;
                        docmaps.markModified('file');
                        docmaps.markModified('filename');
                        docmaps.markModified('events');

                        docmaps.save(function(err) {
                            if (err) {
                                return res.json({
                                    status : "error",
                                    message : "Error updating timeline data for " + req.body.mission
                                });
                            }
                            return res.json({
                                status : "ok",
                                message : "Timeline data updated successfully for " + req.body.mission
                            });
                        });                    
                    }else {
                        //create a new document if not document exists
                        var timeline = new Timeline();
                        timeline.mission =  req.body.mission;
                        timeline.filename = req.body.filename;
                        timeline.file = req.file.originalname;
                        for(var i=0;i<newgroupContents.length;i++){
                            timeline.events.push(newgroupContents[i]);
                        }
                        timeline.save(function(err,result){
                            if(err){
                                return res.json({
                                    status : "error",
                                    message : "Error saving timeline data for " + req.body.mission
                                });
                            }
                            if(result){
                                return res.json({
                                    status : "ok",
                                    message : "Timeline data saved successfully for " + req.body.mission
                                });
                            }
                        });
                    }
                });
            } catch (e){
                return res.json({
                    status : "error",
                    message : "Corrupted excel file"
                });
            }
    },

    getTimelines : function(req,res){
        Timeline.find({}, {}, function(err, timelinedata) {
            if (err) {
                console.log("Error finding map data in DB: " + err);
                //throw err;
            }

            if(timelinedata) {
                var timelinelist = [];
                for(var i=0;i<timelinedata.length;i++){
                    timelinelist.push({
                        "filename":timelinedata[i].filename,
                        "mission":timelinedata[i].mission,
                        "file":timelinedata[i].file
                    });
                }
               res.send(timelinelist);
            }
        });
    },

    removeTimeline : function(req,res){
        var filename = req.body.filename;
        var mission = req.body.mission;

        Timeline.findOne({'mission':mission}, function(err, timeline) {
            if (err) {
                console.log("Error finding timeline: " + err);
                //throw err;
            }
            if(timeline){
                timeline.remove();
                res.json({error_code:0,err_desc:null});
            }
        });
    }
}