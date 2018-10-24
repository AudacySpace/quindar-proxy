var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var IMG = require('../server/model/imagemap');
var sysMapCtrl = require('../server/routes/controllers/systemmap.controller');

describe('Test Suite for imagemap Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new IMG();
        m.validate(function(err) {
            expect(err.errors.mission).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new IMG({
            uploadedfiles: [],
            mission: 'Azero'
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if mission is not defined', function() {
        var m = new IMG({
            uploadedfiles: []
        });
        m.validate(function(err){
            expect(err.errors.mission).to.exist;
            expect(err.errors.mission.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if mission is not a string type', function() {
        var m = new IMG({
            mission: {},
            uploadedfiles: []
        });
        m.validate(function(err){
            expect(err.errors.mission.name).to.exist;
            expect(err.errors.mission.name).to.equal('CastError');
        });  
    });
});

describe('Test Suite for SystemMap Route Controller', function() {
    beforeEach(function() {
        sinon.stub(IMG, 'find');
        sinon.stub(IMG,'findOne');
        sinon.stub(IMG.prototype,'save');
    });

    afterEach(function() {
        IMG.find.restore();
        IMG.findOne.restore();
        IMG.prototype.save.restore();
    });

    it('should get all system images', function() {
        var imageData = [
            {
                "mission": "AZero",
                "uploadedfiles": [
                    {
                        "contentsfile": "imagedata.json",
                        "imagefile": "image2.JPG",
                        "contents": [
                            {
                                "id": "solararrayvalue",
                                "coords": {
                                    "left": "25%",
                                    "top": "5%",
                                    "position": "absolute"
                                },
                                "value": "36W BOL"
                            },
                            {
                                "id": "chargingvalue",
                                "coords": {
                                    "left": "20%",
                                    "top": "68%",
                                    "position": "absolute"
                                },
                                "value": "1.3A"
                            }
                        ],
                        "image": "xyz",
                        "imageid": "PowerSystem"
                    }
                ]
            }
        ];

        var list = [{
            contentsfile: "imagedata.json",
            imagefile: "image2.JPG",
            imageid: "PowerSystem",
            mission: "AZero"
        }];

        IMG.find.yields(null, imageData);

        var req = {
            query : {}

        };
        var res = {
            send: sinon.stub()
        };
 
        sysMapCtrl.getImageList(req, res);
        sinon.assert.calledWith(IMG.find,{},{},sinon.match.func);
        expect(res.send.calledOnce).to.be.true;
        sinon.assert.calledWith(res.send, list);
    });

    it('should not get all system images when error', function() {
        IMG.find.yields({"name":"Mongo Error"},null);

        var req = {
            query : {}

        };
        var res = {
            send: sinon.stub()
        };

        sysMapCtrl.getImageList(req, res);
        sinon.assert.calledWith(IMG.find,{},{},sinon.match.func);
        expect(res.send.calledOnce).to.be.false;
    });

    it('should remove the system map files when deleted', function() {
        var imageData = {
            "mission": "AZero",
            "uploadedfiles": [
                {
                    "contentsfile": "imagedata.json",
                    "imagefile": "image2.JPG",
                    "contents": [
                        {
                            "id": "solararrayvalue",
                            "coords": {
                                "left": "25%",
                                "top": "5%",
                                "position": "absolute"
                            },
                            "value": "36W BOL"
                        },
                        {
                            "id": "chargingvalue",
                            "coords": {
                                "left": "20%",
                                "top": "68%",
                                "position": "absolute"
                            },
                            "value": "1.3A"
                        }
                    ],
                    "image": "xyz",
                    "imageid": "PowerSystem"
                }
            ],
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            },
            remove: function(){}
        };

        IMG.findOne.yields(null, imageData);

        var req = {
            body : {
                'mission' : 'AZero',
                'imageid' : 'PowerSystem'
            }
        };
        var res = {
            json: sinon.stub()
        };

        sysMapCtrl.removeImage(req, res);
        sinon.assert.calledWith(IMG.findOne, {'mission' : 'AZero'}, sinon.match.func);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, {error_code:0,err_desc:null});
    });

    it('should not remove system map files when error', function() {
        IMG.findOne.yields({"name":"Mongo Error"},null);
        var req = {
            body : {
                'mission' : 'AZero'
            }
        };
        var res = {
            json: sinon.stub()
        };

        sysMapCtrl.removeImage(req, res);
        sinon.assert.calledWith(IMG.findOne,{'mission' : 'AZero'},sinon.match.func);
        expect(res.json.calledOnce).to.be.false;
    });

    it('should save the system map images and contents when uploaded', function() {
        var sysMap = null;
        IMG.findOne.yields(null, sysMap);

        var req = {
            body : {
                'mission' : 'AZero',
                'imageid' : 'SYS1'
            },
            files : {
                image: [{
                    fieldname: 'image',
                    originalname: 'systemmap.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    destination: './server/routes/files/',
                    filename: 'systemmap.jpg',
                    path: './server/routes/files/systemmap.jpg',
                    size: 199918
                }],
                contents: [{ 
                    fieldname: 'contents',
                    originalname: 'imagedata.json',
                    encoding: '7bit',
                    mimetype: 'application/json',
                    destination: './server/routes/files/',
                    filename: 'imagedata.json',
                    path: './server/routes/files/imagedata.json',
                    size: 2889 
                }]
            }
        };
        var res = {
            json: sinon.stub()
        };

        sysMapCtrl.saveImage(req, res);
        sinon.assert.calledWith(IMG.findOne,{'mission' : 'AZero'},sinon.match.func);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, {error_code:0,err_desc:null});
    });

    it('should save the system map images and contents when uploaded and files for the mission exists', function() {
        var sysMap = {
            "mission": "AZero",
            "uploadedfiles": [
                {
                    "contentsfile": "imagedata.json",
                    "imagefile": "image2.JPG",
                    "contents": [
                        {
                            "id": "solararrayvalue",
                            "coords": {
                                "left": "25%",
                                "top": "5%",
                                "position": "absolute"
                            },
                            "value": "36W BOL"
                        },
                        {
                            "id": "chargingvalue",
                            "coords": {
                                "left": "20%",
                                "top": "68%",
                                "position": "absolute"
                            },
                            "value": "1.3A"
                        }
                    ],
                    "image": "xyz",
                    "imageid": "PowerSystem"
                }
            ],
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            }
        };

        IMG.findOne.yields(null, sysMap);

        var req = {
            body : {
                'mission' : 'AZero',
                'imageid' : 'SYS1'
            },
            files : {
                image: [{
                    fieldname: 'image',
                    originalname: 'systemmap.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    destination: './server/routes/files/',
                    filename: 'systemmap.jpg',
                    path: './server/routes/files/systemmap.jpg',
                    size: 199918
                }],
                contents: [{ 
                    fieldname: 'contents',
                    originalname: 'imagedata.json',
                    encoding: '7bit',
                    mimetype: 'application/json',
                    destination: './server/routes/files/',
                    filename: 'imagedata.json',
                    path: './server/routes/files/imagedata.json',
                    size: 2889 
                }]
            }
        };
        var res = {
            json: sinon.stub()
        };

        sysMapCtrl.saveImage(req, res);
        sinon.assert.calledWith(IMG.findOne,{'mission' : 'AZero'},sinon.match.func);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, {error_code:0,err_desc:null});
    });
});
