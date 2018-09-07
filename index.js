var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });

app.set('port', (process.env.PORT || 5000));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/app/views');

app.use(bodyParser.json()); 

var io = require('socket.io').listen(app.listen(app.get('port'), function(){
	console.log('Server listening at port %d', app.get('port'));
}));

mongoose.Promise = global.Promise;
//Connect to the mongo database
mongoose.connect('mongodb://54.184.232.90:27017/quindar', {useMongoClient : true});

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

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/app'));

//proxy application status =====================================================
require('./server/scripts/proxyAppStatus')();

// routes ======================================================================
require('./server/routes/routes.js')(app);

// script to read socket stream ================================================
require('./server/scripts/socket.js')(io);
