var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var CMD = require('../server/model/command');

describe('Test Suite for Command Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new CMD();
        m.validate(function(err) {
            expect(err.errors.name).to.exist;
            expect(err.errors.arguments).to.exist;
            //expect(err.errors.sent_timestamp).to.exist;
            expect(err.errors.user).to.exist;
            expect(err.errors.mission).to.exist;
            expect(err.errors.entered).to.exist;
            expect(err.errors.locked).to.exist;
            expect(err.errors.sent).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:[],
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            entered:true,
            locked:true,
            sent:true
        });
        m.validate(function(err){
            // expect(err).toEqual(null);
            //assert.isUndefined(err);
            assert.isNull(err);
        });  
    });

    it('should invalidate if name is not defined', function() {
        var m = new CMD({
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            mission:'AZero',
            entered:true,
            locked:true,
            sent:true
        });
        m.validate(function(err){
            expect(err.errors.name).to.exist;
            expect(err.errors.name.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if entered is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:[],
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            locked:true,
            sent:true
        });
        m.validate(function(err){
            expect(err.errors.entered).to.exist;
            expect(err.errors.entered.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if arguments is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:[],
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            entered:true,
            locked:true,
            sent:true
        });
        m.validate(function(err){
            expect(err.errors.arguments).to.exist;
            expect(err.errors.arguments.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if user is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            mission:'AZero',
            response:[],
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            entered:true,
            locked:true,
            sent:true
        });
        m.validate(function(err){
            expect(err.errors.user).to.exist;
            expect(err.errors.user.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if mission is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            response:[],
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            entered:true,
            locked:true,
            sent:true
        });
        m.validate(function(err){
            expect(err.errors.mission).to.exist;
            expect(err.errors.mission.name).to.equal('ValidatorError');
        });  
    });

    it('should validate if response is empty as required is false', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:[],
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            entered:true,
            locked:true,
            sent:true
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if locked is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:[],
            time:'040.13:09:17 UTC',
            entered:true,
            sent:true
        });
        m.validate(function(err){
            expect(err.errors.locked).to.exist;
            expect(err.errors.locked.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if sent is not a defined', function() {
        var m = new CMD({
            name: 'pointing',
            sent_timestamp:'2018-02-09T13:09:17.471Z',
            arguments:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:[],
            sent_to_satellite:true,
            entered:true,
            locked:true
        });
        m.validate(function(err){
            expect(err.errors.sent).to.exist;
            expect(err.errors.sent.name).to.equal('ValidatorError');
        });  
    });

});