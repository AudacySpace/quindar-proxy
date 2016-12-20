var express = require('express');
var app = express();
var server = require('http').createServer(app);
var mongoose = require('mongoose');
var julian = require('julian');
var async = require('async');

app.set('port', (process.env.PORT || 5000));

var io = require('socket.io').listen(app.listen(app.get('port'), function(){
	console.log('Server listening at port %d', app.get('port'));
}));

//Connect to the mongo database

//uncomment this while testing on localhost
//mongoose.connect('mongodb://qsvr.quindar.space:27017/quindar');

//comment the following statement while testing on localhost
mongoose.connect('mongodb://127.0.0.1:27017/quindar');

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
 console.log('Mongoose default connection open\n');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err + '\n');
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

app.use('/public', express.static('public'));

app.get('/', function(request, response) {
	response.writeHead(301, {location: '/public/html/index.html'});
	response.end();
});

require('./app/scripts/parseExcel.js')();
require('./app/scripts/socket.js')(io, julian, async);