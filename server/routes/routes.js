 module.exports = function(app) {

    var multer = require('multer');
    var parse = require('../scripts/parseExcel.js');
    var Config = require('../model/configuration');

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

    /** API path that will upload the files */
    app.post('/upload', getConfig, function(req, res) {
        
        upload(req,res,function(err){
            if(err){
                res.render("sources", { err_desc : err, configlist : req.config });
                return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.render("sources", { err_desc : "No file passed. Please upload an xlsx file.", configlist : req.config });
                return;
            } else {
                res.redirect('/sources');
                parse(req,res);
            }
        })
       
    });
	
    app.get('/',function(req,res){
        res.render("index");
    });

    app.get('/sources', getConfig, function(req,res){
        res.render("sources", { configlist : req.config });
    });

    app.get('/navbar',function(req,res){
        res.render("navbar");
    });

    app.get('/help',function(req,res){
        res.render("help");
    });

    function getConfig( req, res, next){
        Config.find({}, 'source', function(err, config) {
            if (err) {
                console.log("Error finding configurations in DB: " + err);
                throw err;
            }
            req.config = config;  
            next();           
        });
    }

}