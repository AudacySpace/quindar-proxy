 module.exports = function(app) {

    var multer = require('multer');
    var fs = require('fs');
    var jsonfile = require('jsonfile');
    var parse = require('../scripts/parseExcel.js');
    var Config = require('../model/configuration');
    var Imagemap = require('../model/imagemap');

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
            cb(null, '/tmp/imagemaps/');
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
            }else {
                if (file.mimetype !== 'application/octet-stream') {
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


    app.get('/',function(req,res){
        res.render("index");
    });

    app.get('/sources', function(req,res){
        res.render("sources");
    });

    app.get('/imageuploads', function(req,res){
        res.render("imageuploads");
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

}