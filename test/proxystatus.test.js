var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var Status = require('../server/model/proxystatus');

describe('Test Suite for Status Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new Status();
        m.validate(function(err) {
            expect(err.errors['proxytimestamp']).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new Status({
            proxytimestamp: 1527710348
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if proxytimestamp is not of Number type', function() {
        var m = new Status({
            proxytimestamp: "abc"
        });
        m.validate(function(err){
            expect(err.errors['proxytimestamp'].name).to.exist;
            expect(err.errors['proxytimestamp'].name).to.equal('CastError');
        });  
    });
});