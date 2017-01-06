 module.exports = function(app) {

    var multer = require('multer');
    var parse = require('../scripts/parseExcel.js');

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '/tmp/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

    var upload = multer({ //multer settings
                    storage: storage,
                    fileFilter : function(req, file, callback) { //file filter
                        if (['xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single('file');

    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
        
        upload(req,res,function(err){
            if(err){
                console.error(err);
                res.render('sources');
                return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                console.error("No file passed");
                res.render('sources');
                return;
            } else {
                console.log("File uploaded");
                parse(req,res);
            }
        })
       
    });
	
    app.get('/',function(req,res){
        res.render("index");
    });

    app.get('/sources',function(req,res){
        res.render("sources");
    });

    app.get('/navbar',function(req,res){
        res.render("navbar");
    });

    app.get('/help',function(req,res){
        res.render("help");
    });

}