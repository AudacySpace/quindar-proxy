var chai = require("chai");
var spies = require('chai-spies');
chai.use(spies);
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var expect = chai.expect;
var assert = chai.assert;
var CMD = require('../server/model/commandType');

describe('Test Suite for commandType Model ', function() {
    it('should be invalid if the model is empty', function() {
        var m = new CMD();
        m.validate(function(err) {
            expect(err.errors['source.name']).to.exist;
            expect(err.errors['source.ipaddress']).to.exist;
            expect(err.errors['source.filename']).to.exist;
            expect(err.errors.commands).to.exist;
            expect(err.errors.mission).to.exist;
        });
    });

    it('should validate if all of the properties are defined with valid data types', function() {
        var m = new CMD({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            commands : {},
            mission: 'Azero'
        });
        m.validate(function(err){
            assert.isNull(err);
        });  
    });

    it('should invalidate if source name is not a string type', function() {
        var m = new CMD({
            source : {
                name : {},
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            commands : {},
            mission: 'Azero'
        });
        m.validate(function(err){
            expect(err.errors['source.name'].name).to.exist;
            expect(err.errors['source.name'].name).to.equal('CastError');
        });  
    });


    it('should invalidate if source ipaddress is not a string type', function() {
        var m = new CMD({
            source : {
                name : 'Julia',
                ipaddress: {},
                filename:'SIM.xlsx' ,

            },
            contents : {},
            mission: 'Azero'
        });
        m.validate(function(err){
            expect(err.errors['source.ipaddress'].name).to.exist;
            expect(err.errors['source.ipaddress'].name).to.equal('CastError');
        });  
    });

    it('should invalidate if source filename is not a string type', function() {
        var m = new CMD({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:{} ,

            },
            contents : {},
            mission: 'Azero'
        });
        m.validate(function(err){
            expect(err.errors['source.filename'].name).to.exist;
            expect(err.errors['source.filename'].name).to.equal('CastError');
        });  
    });

    it('should invalidate if commands is not defined', function() {
        var m = new CMD({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            mission: 'Azero'
        });
        m.validate(function(err){
        	expect(err.errors.commands.name).to.exist;
            expect(err.errors.commands.name).to.equal('ValidatorError');
        });  
    });

    it('should invalidate if mission is not defined', function() {
        var m = new CMD({
            source : {
                name : 'Julia',
                ipaddress: '34.209.90.133',
                filename:'SIM.xlsx' ,

            },
            commands : {}
        });
        m.validate(function(err){
            expect(err.errors.mission.name).to.exist;
            expect(err.errors.mission.name).to.equal('ValidatorError');
        });  
    });

});