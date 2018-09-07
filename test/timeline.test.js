var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var TIM = require('../server/model/timeline');
var timelineCtrl = require('../server/routes/controllers/timeline.controller');

describe('Test Suite for timeline Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new TIM();
        m.validate(function(err) {
            expect(err.errors.mission).to.exist;
            expect(err.errors.file).to.exist;
            expect(err.errors.filename).to.exist;
            expect(err.errors.events).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new TIM({
            mission: 'Azero',
            filename: "timeline.xlsx",
            file: "Timeline",
            events: [{
                "eventinfo": "Mission time",
                "eventgroup": "Other",
                "eventdata": [
                    {
                        "content": "",
                        "end": "2022-02-01T09:42:00",
                        "start": "2018-02-01T09:42:00"
                    }
                ],
                "eventname": "Mission"
            }]
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if mission is not defined', function() {
        var m = new TIM({
            filename: "timeline.xlsx",
            file: "Timeline",
            events: []
        });
        m.validate(function(err){
            expect(err.errors.mission).to.exist;
            expect(err.errors.mission.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if file is not defined', function() {
        var m = new TIM({
            mission: 'Azero',
            filename: "timeline.xlsx",
            events: []
        });
        m.validate(function(err){
            expect(err.errors.file).to.exist;
            expect(err.errors.file.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if filename is not defined', function() {
        var m = new TIM({
            mission: 'Azero',
            file: "Timeline",
            events: []
        });
        m.validate(function(err){
            expect(err.errors.filename).to.exist;
            expect(err.errors.filename.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if events is not defined', function() {
        var m = new TIM({
            mission: 'Azero',
            file: "Timeline",
            filename: "timeline.xlsx"
        });
        m.validate(function(err){
            expect(err.errors.events).to.exist;
            expect(err.errors.events.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if mission is not a string type', function() {
        var m = new TIM({
            mission: {},
            file: "Timeline",
            filename: "timeline.xlsx",
            events: []
        });
        m.validate(function(err){
            expect(err.errors.mission.name).to.exist;
            expect(err.errors.mission.name).to.equal('CastError');
        });  
    });

    it('should invalidate if filename is not a string type', function() {
        var m = new TIM({
            mission: "Azero",
            file: "Timeline",
            filename: {},
            events: []
        });
        m.validate(function(err){
            expect(err.errors.filename.name).to.exist;
            expect(err.errors.filename.name).to.equal('CastError');
        });  
    });
});

describe('Test Suite for Timeline Route Controller', function() {
    beforeEach(function() {
        sinon.stub(TIM, 'find');
        sinon.stub(TIM,'findOne');
        sinon.stub(TIM.prototype,'save');
    });

    afterEach(function() {
        TIM.find.restore();
        TIM.findOne.restore();
        TIM.prototype.save.restore();
    });

    it('should get all timelines', function() {
        var timelineData = [
            {
                "mission": "AZero",
                "file": "timeline-2.xlsx",
                "filename": "Timeline",
                "events": []
            }
        ];

        var list = [
            {
                "mission": "AZero",
                "file": "timeline-2.xlsx",
                "filename": "Timeline"
            }
        ];

        TIM.find.yields(null, timelineData);

        var req = {
            query : {}

        };
        var res = {
            send: sinon.stub()
        };

        timelineCtrl.getTimelines(req, res);
        sinon.assert.calledWith(TIM.find,{},{},sinon.match.func);
        expect(res.send.calledOnce).to.be.true;
        sinon.assert.calledWith(res.send, list);
    });

    it('should not get all timelines when error', function() {
        TIM.find.yields({"name":"Mongo Error"},null);

        var req = {
            query : {}

        };
        var res = {
            send: sinon.stub()
        };

        timelineCtrl.getTimelines(req, res);
        sinon.assert.calledWith(TIM.find,{},{},sinon.match.func);
        expect(res.send.calledOnce).to.be.false;
    });

    it('should remove the timeline file when deleted', function() {
        var timeline = {
            "mission": "AZero",
            "file": "timeline-2.xlsx",
            "filename": "Timeline",
            "events": [],
            save:function(callback){
                var err = null;
                var res = {"data":""};
                callback(err,res);
            },
            remove:function(){

            }
        };

        TIM.findOne.yields(null, timeline);

        var req = {
            body : {
                'mission' : 'AZero'
            }

        };
        var res = {
            json: sinon.stub()
        };

        timelineCtrl.removeTimeline(req, res);
        sinon.assert.calledWith(TIM.findOne, {'mission' : 'AZero'}, sinon.match.func);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, {error_code:0,err_desc:null});
    });

    it('should not remove timeline files when error', function() {
        TIM.findOne.yields({"name":"Mongo Error"},null);
        var req = {
            body : {
                'mission' : 'AZero'
            }

        };
        var res = {
            json: sinon.stub()
        };

        timelineCtrl.removeTimeline(req, res);
        sinon.assert.calledWith(TIM.findOne,{'mission' : 'AZero'},sinon.match.func);
        expect(res.json.calledOnce).to.be.false;
    });

    it('should not save the erroneous timeline file to database', function() {
        var timeline = null;
        TIM.findOne.yields(null, timeline);

        var req = {
            body : {
                'mission' : 'AZero'
            },
            file : {
                fieldname: 'file',
                originalname: 'timeline_error.xlsx',
                encoding: '7bit',
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                destination: './server/routes/files/',
                filename: 'Timeline.xlsx',
                path: './server/routes/files/timeline_error.xlsx',
                size: 18320
            }
        };
        var res = {
            json: sinon.stub()
        };

        timelineCtrl.saveTimeline(req, res);
        expect(res.json.calledOnce).to.be.true;
        sinon.assert.calledWith(res.json, { message: "Invalid files: Sheet1/Sheet2 is empty", status: "error" });
    });

    it('should save the timeline file to database when uploaded', function() {
        var timeline = null;
        TIM.findOne.yields(null, timeline);

        var req = {
            body : {
                'mission' : 'AZero'
            },
            file : {
                fieldname: 'file',
                originalname: 'timeline-2.xlsx',
                encoding: '7bit',
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                destination: './server/routes/files/',
                filename: 'timeline-2.xlsx',
                path: './server/routes/files/timeline-2.xlsx',
                size: 18320
            }
        };
        var res = {
            json: sinon.stub()
        };

        timelineCtrl.saveTimeline(req, res);
        sinon.assert.calledWith(TIM.findOne,{'mission' : 'AZero'},sinon.match.func);
        sinon.assert.calledOnce(TIM.prototype.save);
    });

});
