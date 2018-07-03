var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var TM = require('../server/model/telemetry');

describe('Test Suite for Telemetry Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new TM();
        m.validate(function(err) {
            expect(err.errors.mission).to.exist;
            expect(err.errors.timestamp).to.exist;
            expect(err.errors.telemetry).to.exist;
            expect(err.errors.source).to.exist;
        });
    });

    it('should validate mission is a valid string type and telemetry is an object type and timestamp is date type', function() {
        var m = new TM({mission: 'AZero',timestamp:'2018-02-01T09:42:01.287Z',telemetry:{}, source: "Julia"});
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate when mission is not a string type', function () {
        var m = new TM({mission: {},timestamp:'2018-02-01T09:42:01.287Z',telemetry:{}, source: "Julia"});
        m.validate(function(err) {
            expect(err.errors.mission).to.exist;
            expect(err.errors.mission.name).to.equal('CastError');
        });
    });

    it('should invalidate when timestamp is not defined', function () {
        var m = new TM({mission: 'AZero',telemetry:{}, source: "Julia"});
        m.validate(function(err) {
            expect(err.errors.timestamp).to.exist;
            expect(err.errors.timestamp.name).to.equal('ValidatorError');
        });
    });

    it('should invalidate when telemetry is not defined', function () {
        var m = new TM({mission: 'AZero',timestamp:'2018-02-01T09:42:01.287Z', source: "Julia"});
        m.validate(function(err) {
            expect(err.errors.telemetry).to.exist;
            expect(err.errors.telemetry.name).to.equal('ValidatorError');
        });
    });

    it('should invalidate when source is not defined', function () {
        var m = new TM({mission: 'AZero',timestamp:'2018-02-01T09:42:01.287Z', telemetry:{}});
        m.validate(function(err) {
            expect(err.errors.source).to.exist;
            expect(err.errors.source.name).to.equal('ValidatorError');
        });
    });

});
