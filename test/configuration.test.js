var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var CFG = require('../server/model/configuration');
var configCtrl = require('../server/routes/controllers/configuration.controller');
var aggregatorCtrl = require('../server/routes/controllers/aggregator.controller');

describe('Test Suite for Configuration Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new CFG();
        m.validate(function(err) {
            expect(err.errors['source.name']).to.exist;
            expect(err.errors['source.ipaddress']).to.exist;
            expect(err.errors['source.filename']).to.exist;
            //expect(err.errors.contents).to.exist;
            expect(err.errors.mission).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            contents : {},
            mission: 'Azero',
            simulated: false,
            attachments : []
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if source name is not a string type', function() {
        var m = new CFG({
            source : {
                name : {},
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            contents : {},
            simulated: false,
            mission: 'Azero'
        });
        m.validate(function(err){
            expect(err.errors['source.name'].name).to.exist;
            expect(err.errors['source.name'].name).to.equal('CastError');
        });  
    });


    it('should invalidate if source ipaddress is not a string type', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: {},
                filename:'SIM.xlsx' ,

            },
            contents : {},
            simulated: false,
            mission: 'Azero'
        });
        m.validate(function(err){
            expect(err.errors['source.ipaddress'].name).to.exist;
            expect(err.errors['source.ipaddress'].name).to.equal('CastError');
        });  
    });

    it('should invalidate if source filename is not a string type', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:{} ,

            },
            contents : {},
            simulated: false,
            mission: 'Azero'
        });
        m.validate(function(err){
            expect(err.errors['source.filename'].name).to.exist;
            expect(err.errors['source.filename'].name).to.equal('CastError');
        });  
    });

    it('should validate if contents is not defined', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            simulated: false,
            mission: 'Azero'
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if mission is not defined', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            simulated: false,
            contents : {}
        });
        m.validate(function(err){
            expect(err.errors.mission.name).to.exist;
            expect(err.errors.mission.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if simulated property is not defined', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            contents : {},
            mission: 'Azero',
            attachments : []
        });
        m.validate(function(err){
            expect(err.errors.simulated.name).to.exist;
            expect(err.errors.simulated.name).to.equal('ValidatorError');
        });
    });

    it('should validate if attachments is not defined', function() {
        var m = new CFG({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            mission: 'Azero',
            contents : {}
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

});

describe('Test Suite for Configuration Route Controller', function() {
    beforeEach(function() {
        sinon.stub(CFG, 'find');
        sinon.stub(CFG,'findOne');
        sinon.stub(CFG.prototype,'save');
        sinon.stub(CFG,'remove');
    });

    afterEach(function() {
        CFG.find.restore();
        CFG.findOne.restore();
        CFG.prototype.save.restore();
        CFG.remove.restore();
    });

    it('should get all configurations', function() {
        CFG.find.yields(null, {"data":"100","status":200});
        var req = {
            query : {}

        };
        var res = {
            send: sinon.stub()
        };

        configCtrl.getConfig(req, res);
        sinon.assert.calledWith(CFG.find,{},{ mission: 1, source: 1, simulated: 1 },sinon.match.func);
        expect(res.send.calledOnce).to.be.true;
        sinon.assert.calledWith(res.send, {"data":"100","status":200});
    });

    it('should not get all configurations when error', function() {
        CFG.find.yields({"name":"Mongo Error"},null);
        var req = {
            query : {}

        };
        var res = {
            send: sinon.stub()
        };

        configCtrl.getConfig(req, res);
        sinon.assert.calledWith(CFG.find,{},{ mission: 1, source: 1, simulated: 1 },sinon.match.func);
        expect(res.send.calledOnce).to.be.false;
    });

    it('should remove the configuration file when deleted', function() {
        var config = {
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [],
            "contents": {},
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            remove:function(){

            }
        };

        CFG.findOne.yields(null, config);

        var req = {
            body : {
                'sourceIp' : '10.0.0.100'
            }
        };

        var res = {
            json : sinon.stub()
        }

        configCtrl.removeConfig(req, res);
        sinon.assert.calledWith(CFG.findOne, {'source.ipaddress' : '10.0.0.100'}, sinon.match.func);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, {'message' : 'Configuration deleted successfully'});
    });

    it('should not remove configuration files when error', function() {
        CFG.findOne.yields({"name":"Mongo Error"}, null);
        var req = {
            body : {
                'sourceIp' : '10.0.0.100'
            }

        };
        var res = {
            json: sinon.stub()
        };

        configCtrl.removeConfig(req, res);
        sinon.assert.calledWith(CFG.findOne, {'source.ipaddress' : '10.0.0.100'}, sinon.match.func);
        expect(res.json.calledOnce).to.be.false;
    });
});

describe('Test Suite for Aggregation Route Controller', function() {
    beforeEach(function() {
        sinon.stub(CFG, 'find');
        sinon.stub(CFG,'findOne');
        sinon.stub(CFG.prototype,'save');
        sinon.stub(CFG,'remove');
    });

    afterEach(function() {
        CFG.find.restore();
        CFG.findOne.restore();
        CFG.prototype.save.restore();
        CFG.remove.restore();
    });

    it('should get all aggregator files related to the configuration', function() {
        var configuration = { 
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [{
                "id": 1,
                "filename": "agg1.csv",
                "contents": [
                    {
                        "name": "param1",
                        "length": 20
                    },
                    {
                        "name": "param2",
                        "length": 12
                    },
                    {
                        "name": "param3",
                        "length": 16
                    }
                ]
            },
            {
                "id": 2,
                "filename": "agg2.csv",
                "contents": [
                    {
                        "name": "param1",
                        "length": 20
                    },
                    {
                        "name": "param2",
                        "length": 12
                    },
                    {
                        "name": "param3",
                        "length": 16
                    }
                ]
            }],
            "contents": {}
        }

        CFG.findOne.yields(null, configuration);

        var req = {
            query : {
                'sourceip' : '10.0.0.100'
            }
        };
        var res = {
            send: sinon.stub()
        };

        aggregatorCtrl.getAttachments(req, res);
        sinon.assert.calledWith(CFG.findOne, {'source.ipaddress' : '10.0.0.100'}, sinon.match.func);
        expect(res.send.calledOnce).to.be.true;
        sinon.assert.calledWith(res.send, configuration.attachments);
    });

    it('should not get all aggregator files when error', function() {
        CFG.findOne.yields({"name":"Mongo Error"},null);
        var req = {
            query : {
                'sourceip' : '10.0.0.100'
            }
        };
        var res = {
            send: sinon.stub()
        };

        aggregatorCtrl.getAttachments(req, res);
        sinon.assert.calledWith(CFG.findOne,{'source.ipaddress' : '10.0.0.100'},sinon.match.func);
        expect(res.send.calledOnce).to.be.false;
    });

    it('should save the aggregator file data when uploaded(add for new beacon ID)', function() {
        var aggregatorCtrl = require('../server/routes/controllers/aggregator.controller');
        var configuration = { 
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [],
            "contents": {},
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            }
        };

        CFG.findOne.yields(null, configuration);

        var req = {
            body : {
                'sourceip' : '10.0.0.100',
                'id' : '1'
            },
            file : {
                path: './server/routes/files/agg.csv'
            }
        };
        var res = {
            json: sinon.stub()
        };

        aggregatorCtrl.saveFile(req, res, function(callback){
            sinon.assert.calledWith(CFG.findOne,{'source.ipaddress' : '10.0.0.100'},sinon.match.func);
            expect(res.json.calledOnce).to.be.true;
            sinon.assert.calledWith(res.json, {error_code:0,error_desc:"add"});
        });
    });

    it('should save the aggregator file data when uploaded(update for existing beacon ID)', function() {
        var aggregatorCtrl = require('../server/routes/controllers/aggregator.controller');
        var configuration = {
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [{
                "id": 1,
                "filename": "agg1.csv",
                "contents": [
                    {
                        "name": "param1",
                        "length": 20
                    },
                    {
                        "name": "param2",
                        "length": 12
                    },
                    {
                        "name": "param3",
                        "length": 16
                    }
                ]
            }],
            "contents": {},
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            }
        };

        CFG.findOne.yields(null, configuration);

        var req = {
            body : {
                'sourceip' : '10.0.0.100',
                'id' : '1'
            },
            file : {
                path: './server/routes/files/agg.csv'
            }
        };
        var res = {
            json: sinon.stub()
        };

        aggregatorCtrl.saveFile(req, res, function(callback){
            sinon.assert.calledWith(CFG.findOne,{'source.ipaddress' : '10.0.0.100'},sinon.match.func);
            expect(res.json.calledOnce).to.be.true;
            sinon.assert.calledWith(res.json, {error_code:0,error_desc:"update"});
        });
    });

    it('should not save the aggregator file data when the Bits column is non numeric', function() {
        var aggregatorCtrl = require('../server/routes/controllers/aggregator.controller');
        var configuration = {
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [],
            "contents": {},
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            }
        };

        CFG.findOne.yields(null, configuration);

        var req = {
            body : {
                'sourceip' : '10.0.0.100',
                'id' : '1'
            },
            file : {
                path: './server/routes/files/agg_notNumeric.csv'
            }
        };
        var res = {
            json: sinon.stub()
        };

        aggregatorCtrl.saveFile(req, res, function(callback){
            expect(res.json.calledOnce).to.be.true;
            sinon.assert.calledWith(res.json, {error_code:1,error_desc:"Bits column has non numeric data"});
        });
    });

    it('should not save the aggregator file data when all rows do not have 2 columns', function() {
        var aggregatorCtrl = require('../server/routes/controllers/aggregator.controller');
        var configuration = {
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [],
            "contents": {},
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            }
        };

        CFG.findOne.yields(null, configuration);
        
        var req = {
            body : {
                'sourceip' : '10.0.0.100',
                'id' : '1'
            },
            file : {
                path: './server/routes/files/agg_error.csv'
            }
        };
        var res = {
            json: sinon.stub()
        };

        aggregatorCtrl.saveFile(req, res, function(callback){
            expect(res.json.calledOnce).to.be.true;
            sinon.assert.calledWith(res.json, {error_code:1,error_desc:"Does not have all the rows data"});
        });
    });

    it('should remove the aggregator file when deleted', function() {
        var configuration = {
            "source": {
                "filename": "Gateway.xlsx",
                "ipaddress": "10.0.0.100",
                "name": "Test Gateway"
            },
            "mission": "Test",
            "attachments": [{
                "id": 1,
                "filename": "agg1.csv",
                "contents": [
                    {
                        "name": "param1",
                        "length": 20
                    },
                    {
                        "name": "param2",
                        "length": 12
                    },
                    {
                        "name": "param3",
                        "length": 16
                    }
                ]
            },
            {
                "id": 2,
                "filename": "agg2.csv",
                "contents": [
                    {
                        "name": "param1",
                        "length": 20
                    },
                    {
                        "name": "param2",
                        "length": 12
                    },
                    {
                        "name": "param3",
                        "length": 16
                    }
                ]
            }],
            "contents": {},
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            markModified:function(field){

            }
        };

        CFG.findOne.yields(null, configuration);

        var req = {
            body : {
                'sourceip' : '10.0.0.100',
                'id' : 1
            }
        };
        var res = {
            json: sinon.stub()
        };

        aggregatorCtrl.removeAttachment(req, res);
        sinon.assert.calledWith(CFG.findOne, {'source.ipaddress' : '10.0.0.100'}, sinon.match.func);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, {error_code:0,err_desc:null});
    });

    it('should not remove aggregator files when error', function() {
        CFG.findOne.yields({"name":"Mongo Error"},null);
        var req = {
            body : {
                'sourceip' : '10.0.0.100',
                'id' : 1
            }
        };
        var res = {
            json: sinon.stub()
        };

        aggregatorCtrl.removeAttachment(req, res);
        sinon.assert.calledWith(CFG.findOne,{'source.ipaddress' : '10.0.0.100'},sinon.match.func);
        expect(res.json.calledOnce).to.be.false;
    });
});
