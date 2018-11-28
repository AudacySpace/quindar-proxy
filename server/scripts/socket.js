module.exports = function(io) {

	var Command = require('../model/command');
	var source = "";
	var clients = {};
	var missionConfig = require('../config/mission');

	//Listen to the GMAT server streaming data
	io.on('connection', function(socket){
		console.log('socket server connected');

		//add clients socket id using mission name
		socket.on('add-mission', function(data){
			console.log("Started mission: " + data.mission);
			clients[data.mission] = {
				"socket" : socket.id
			}

			var missionLib = require(missionConfig[data.mission]["library"]);
			missionLib(socket);
		});

		socket.on('disconnect', function(reason){
			console.log("socket disconnected due to: " + reason);
			socket.disconnect(true);
			for(var client in clients){
		        if(clients[client]["socket"] == socket.id){
					delete clients[client];
		        }
		    }
		});

		socket.on('comm-ack', function(data){
			var commandResponse = JSON.parse(data);
			if(commandResponse.metadata && commandResponse.metadata.sent_timestamp){
				Command.findOne( {'sent_timestamp': commandResponse.metadata.sent_timestamp}, function(err, command) {
					if(err){
						console.log(err);
					}

					if(command) {
						if(commandResponse.metadata.hasOwnProperty('status') && commandResponse.metadata.hasOwnProperty('data') && commandResponse.hasOwnProperty('timestamp')){
							command.response.push({
								"status":commandResponse.metadata.status,
								"metadata_data":commandResponse.metadata.data,
								"gwp_timestamp":commandResponse.timestamp,
								"data":commandResponse.data
							});
						}

						command.save(function(err,result){
							if(err){
								console.log(err);
							}
							console.log("Response added for the command");
						})
					}
				})
			}

		});
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
						var currentUnixTime = new Date().getTime();
						if(clients[commands[i].mission]) {
							var newcommand = {
								"mission":"",
								"timestamp":"",
								"metadata":{},
								"command":""
							};

							//set the json object to be sent to the. source
							newcommand.mission = commands[i].mission;
							newcommand.timestamp = commands[i].sent_timestamp;
							newcommand.metadata.cmd = commands[i].name;
							newcommand.metadata.arg = commands[i].arguments;
							newcommand.command = "";

							var room = clients[commands[i].mission]["socket"];
							if(room) {
								io.to(room).emit("command", newcommand);
								commands[i].sent_to_satellite = true;
								commands[i].response.push({
									"status" : "sent to gateway",
									"gwp_timestamp" : currentUnixTime,
								});

								commands[i].save(function(err,result){
									if(err){
										console.log(err);
									}

									console.log("Flag updated for sent command");
								})
							}
						} else {
							//cancel commands
							commands[i].sent_to_satellite = true;
							commands[i].response.push({
								"status":"socket not connected",
								"gwp_timestamp": currentUnixTime
							});

							commands[i].save(function(err,result){
								if(err){
									console.log(err);
								}

								console.log("Flag updated for cancelled command");
							})
						}
					}
				}
			}
		});
	}, 1000);
}
