 module.exports = function(app) {

    var multer = require('multer');
    var fs = require('fs');
    var XLSX = require("xlsx");
    var jsonfile = require('jsonfile');
    var parse = require('../scripts/parseExcel.js');
    var parseCommands = require('../scripts/parseCommands.js');
    var Config = require('../model/configuration');
    var Imagemap = require('../model/imagemap');
    var Timeline = require('../model/timeline');

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '/tmp/uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

    var upload = multer({ //multer settings
        storage: storage,
        fileFilter : function(req, file, callback) { //file filter
            if (['xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                return callback(new Error('Wrong extension. Please upload an xlsx file.'));
            }
            callback(null, true);
        }
    }).single('file');


    var imagestorage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '/tmp/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

    var imageupload = multer({ //multer settings to upload image and its contents
        storage: imagestorage,
        fileFilter : function(req, file, callback) { //file filter
            if(file.fieldname === 'image'){
                if (file.mimetype !== 'image/jpeg') {
                    console.log('Wrong format!');
                    return callback(null, false, new Error('Wrong format!'));
                }
            }
            callback(null, true);

        }
    }).fields([{
        name: 'image', maxCount: 1
    }, {
        name: 'contents', maxCount: 1
    }]);


    var filestorage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '/tmp/uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

    var timelinedataupload = multer({ //multer settings
        storage: filestorage,
        fileFilter : function(req, file, callback) { //file filter
            if (['xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                return callback(new Error('Wrong extension. Please upload an xlsx file.'));
            }
            callback(null, true);
        }
    }).single('file');


    app.get('/',function(req,res){
        res.render("index");
    });

    app.get('/sources', function(req,res){
        res.render("sources");
    });

    app.get('/imageuploads', function(req,res){
        res.render("imageuploads");
    });

    app.get('/timelineuploads', function(req,res){
        res.render("timelineuploads");
    });

    app.get('/navbar',function(req,res){
        res.render("navbar");
    });

    app.get('/help',function(req,res){
        res.render("help");
    });

    app.get('/getConfig', function(req,res){
        Config.find({}, { source : 1, mission : 1 }, function(err, config) {
            if (err) {
                console.log("Error finding configurations in DB: " + err);
                throw err;
            }

            res.send(config);
        });
    });

    //Displays all the images of each mission in display sources page in a table
    app.get('/getImageList', function(req,res){
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
    });

    app.post('/upload', function(req, res) {
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            parse(req,res);
            parseCommands(req,res);
            res.json({error_code:0,err_desc:null});
        });
    });

    //To save image and its valid contents
    app.post('/saveImages', function(req, res) {
        imageupload(req,res,function(err){
            if(err){
                console.log(err);
                res.json({error_code:1,err_desc:err});
                return;
            }

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
        });
    });

    app.post('/removeImageMap', function(req,res){
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
    });

    //To save Timeline Data
    app.post('/saveTimelineData', function(req, res) {
        timelinedataupload(req,res,function(err){
            if(err){
                console.log(err);
                res.json({error_code:1,err_desc:err});
                return;
            }

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
                        console.log(err);
                    }

                    if(docmaps){
                        docmaps.events = newgroupContents;
                        docmaps.filename = req.body.filename;
                        docmaps.file = req.file.originalname;
                        docmaps.markModified('file');
                        docmaps.markModified('filename');
                        docmaps.markModified('events');
                        docmaps.save(function(err) {
                        if (err) throw err;
                            console.log(' Timeline data updated successfully for ' + req.body.mission);
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
                                console.log(err);
                            }
                            if(result){
                                console.log('Timeline data saved successfully for ' + req.body.mission);
                            }
                        });
                    }
                });

                if(sheets.sheet1.length > 0 && sheets.sheet2.length > 0){
                    res.json({error_code:0,err_desc:null});
                }else {
                    res.json({error_code:1,err_desc:"No excel data"});
                }
                
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        });
    });

    //Displays all the timeline files of each mission in a table
    app.get('/getMissionTimelines', function(req,res){
        Timeline.find({}, {}, function(err, timelinedata) {
            if (err) {
                console.log("Error finding map data in DB: " + err);
                throw err;
            }

            var timelinelist = [];
            for(var i=0;i<timelinedata.length;i++){
                    timelinelist.push({
                        "filename":timelinedata[i].filename,
                        "mission":timelinedata[i].mission,
                        "file":timelinedata[i].file
                    });
            }
           res.send(timelinelist); 
        });
    });

    //remove timeline from timelines collection
    app.post('/removeTimeline', function(req,res){
        var filename = req.body.filename;
        var mission = req.body.mission;

        Timeline.findOne({'mission':mission}, function(err, timeline) {
            if (err) {
                console.log("Error finding timeline: " + err);
                throw err;
            }
            timeline.remove();
        });
        res.json({error_code:0,err_desc:null});
    });
}
