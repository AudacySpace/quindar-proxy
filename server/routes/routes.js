 module.exports = function(app) {

    var multer = require('multer');
    // var fs = require('fs');
    // var XLSX = require("xlsx");
    // var jsonfile = require('jsonfile');
    // var csv = require('csvtojson');
    // var parse = require('../scripts/parseExcel.js');
    // var parseCommands = require('../scripts/parseCommands.js');
    // var Config = require('../model/configuration');
    // var Imagemap = require('../model/imagemap');
    // var Timeline = require('../model/timeline');
    var configCtrl =  require('./controllers/configuration.controller');
    var imageCtrl =  require('./controllers/systemmap.controller');
    var timelineCtrl =  require('./controllers/timeline.controller');
    var aggCtrl = require('./controllers/aggregator.controller');

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

    //Storage for uploaded attachments
    var attachmentsStorage = multer.diskStorage({
        destination: function(req,file,cb){
            cb(null,'/tmp/uploads/')
        },
        filename: function(req,file,cb){
            cb(null,file.originalname);
        }
    });

    //function to upload aggregator file
    var attachmentsupload = multer({
        storage: attachmentsStorage,
        fileFilter: function(req,file,callback){
            if(['csv'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1){
                return callback(new Error('Wrong extension. Please upload a csv file.'));
            }
            callback(null,true);
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

    //Get the list of configurations
    app.get('/getConfig', configCtrl.getConfig);

    //Upload the configuration file and save in the database
    app.post('/upload', upload, configCtrl.uploadFile);

    //Displays all the images of each mission in display sources page in a table
    app.get('/getImageList', imageCtrl.getImageList);

    //To save image and its valid contents
    app.post('/saveImages', imageupload, imageCtrl.saveImage);

    //Remove the image and its contents
    app.post('/removeImageMap', imageCtrl.removeImage);

    //To save Timeline Data
    app.post('/saveTimelineData', timelinedataupload, timelineCtrl.saveTimeline);

    //Displays all the timeline files of each mission in a table
    app.get('/getMissionTimelines', timelineCtrl.getTimelines);

    //remove timeline from timelines collection
    app.post('/removeTimeline', timelineCtrl.removeTimeline);

    //To save Aggregator File Data
    app.post('/saveAggregatorFile', attachmentsupload, aggCtrl.saveFile );

    //Get and display the list of attachments per mission and source
    app.get('/getAttachments', aggCtrl.getAttachments);

    //remove attachment from the array for the configuration
    app.post('/removeAttachment', aggCtrl.removeAttachment);
}
