var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var IMG = require('../server/model/imagemap');

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