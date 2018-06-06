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
            expect(err.errors.argument).to.exist;
            expect(err.errors.timestamp).to.exist;
            expect(err.errors.user).to.exist;
            expect(err.errors.mission).to.exist;
            expect(err.errors.sent_to_satellite).to.exist;
            expect(err.errors.time).to.exist;
            expect(err.errors.type).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            // expect(err).toEqual(null);
            //assert.isUndefined(err);
            assert.isNull(err);
        });  
    });

    it('should invalidate if name is not defined', function() {
        var m = new CMD({
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.name).to.exist;
            expect(err.errors.name.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if timestamp is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.timestamp).to.exist;
            expect(err.errors.timestamp.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if argument is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.argument).to.exist;
            expect(err.errors.argument.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if user is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.user).to.exist;
            expect(err.errors.user.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if mission is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.mission).to.exist;
            expect(err.errors.mission.name).to.equal('ValidatorError');
        });  
    });

    it('should validate if response is empty as required is false', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if sent_to_satellite is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            time:'040.13:09:17 UTC',
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.sent_to_satellite).to.exist;
            expect(err.errors.sent_to_satellite.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if time is not a defined', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            type:'Set'
        });
        m.validate(function(err){
            expect(err.errors.time).to.exist;
            expect(err.errors.time.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if type is not defined', function() {
        var m = new CMD({
            name: 'pointing',
            timestamp:'2018-02-09T13:09:17.471Z',
            argument:'earth',
            user:'taruni.gattu@gmail.com',
            mission:'AZero',
            response:'success',
            sent_to_satellite:true,
            time:'040.13:09:17 UTC'
        });
        m.validate(function(err){
            expect(err.errors.type).to.exist;
            expect(err.errors.type.name).to.equal('ValidatorError');
        });  
    });

});