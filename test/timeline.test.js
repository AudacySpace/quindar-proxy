var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var TIM = require('../server/model/timeline');

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