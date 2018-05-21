module.exports = function(io) {

	// var math = require('mathjs');
	// var Config = require('../model/configuration');
	// var Telemetry = require('../model/telemetry');
	var Command = require('../model/command');
	var source = "";
	// var configuration = new Config();
	var newcommand = {};
	var clients = {};
	var missionConfig = require('../config/mission');

	//Listen to the GMAT server streaming data
	io.on('connection', function(socket){
		console.log('socket.io server connected.');

		//add clients socket id using mission name
		socket.on('add-mission', function(data){
			clients[data.mission] = {
				"socket" : socket.id
			}

			var missionLib = require(missionConfig[data.mission]["library"]);
			missionLib(socket);
		});

		socket.on('disconnect', function(){
			for(var client in clients){
		        if(clients[client]["socket"] == socket.id){
					delete clients[client];
		        }
		    }
		});

		//poll database for new commands and send them to satellite/simulator
		setInterval(function() {
			Command.find( {'sent_to_satellite': false}, function(err, commands) {
	            if(err){
	                console.log(err);
	            }

	            if(commands) {
		            if(commands.length>0) {
						for(var i=0; i<commands.length; i++){
							newcommand.name = commands[i].name.toLowerCase();
							newcommand.argument = commands[i].argument.toLowerCase();
							newcommand.type = commands[i].type.toLowerCase();
							newcommand.timestamp = commands[i].timestamp;

							if(clients[commands[i].mission]) {
								var room = clients[commands[i].mission]["socket"];
								if(room) {
									io.to(room).emit("command", newcommand);
									commands[i].sent_to_satellite = true;

									commands[i].save(function(err,result){
										if(err){
											console.log(err);
										}

										console.log("Flag updated for sent command");
									})
								}
							}
			            }
		            }
		        }
	        });
		}, 1000);

		socket.on('comm-ack', function(data){
			Command.findOne( {'timestamp': data.timestamp}, function(err, command) {
	            if(err){
	                console.log(err);
	            }

	            if(command) {
					command.response = data.response;

					command.save(function(err,result){
						if(err){
							console.log(err);
						}

						console.log("Response added for the command");
					})
				}
			})
		});
	});
}