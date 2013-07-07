/**
 * OISC MITM
 * Copyright 2013 @nbar1
 *
 * Modify your local machine host files to point stage.ogreisland.com to your server
 */

// Load the TCP Library
net = require('net');
 
// Keep track of the chat clients
var clients = [];

var red, blue, reset;
red = '\033[31m';
blue = '\033[34m';
reset = '\033[0m';


// Start a TCP Server
var server = net.createServer(function (socket) {
 
	// Identify this client
	socket.name = socket.remoteAddress + ":" + socket.remotePort;
	socket.setKeepAlive(true, 120000);
	// Put this new client in the list
	clients.push(socket);
	
	// Send a nice welcome message and announce
	socket.write("Welcome " + socket.name + "\n");
	console.log(socket.name + " initiated\n");
	
	// Handle incoming messages from clients.
	socket.on('data', function (data) {
		console.log('client sending: ' + data);
		//console.log(client);
		
		data = preparsePacket(data);
		
		
		
	  	client.write(data);
	});
	socket.on('error', function (error) {
		console.log('error-socket: '+error);
	});
	
	// Remove the client from the list when it leaves
	socket.on('end', function () {
		clients.splice(clients.indexOf(socket), 1);
		console.log(socket.name + " CLIENT disconnected.\n");
	});





	/*
	 * Start Client
	 */
	var client = net.createConnection({port: 5301, host:'stage.ogreisland.com'}, function() { //'connect' listener
		console.log('client connected');
		var getShellStatus = setTimeout(function(){
			socket.write("<p c='3'><m p='2' p0='SV' p1='_root.me.speed' p2='100'/><m p='2' p0='SV' p1='_root.map._xscale' p2='500'/><m p='2' p0='SV' p1='_root.map._yscale' p2='500'/></p>");
			console.log('setting speed and zoom');
		}, 10000);
	});
	client.on('data', function(data) {
		console.log(red + 'from oi: ' + reset + blue + data + reset);

		//socket.write("<p c='4'><m p='2' p0='SV' p1='_root.me.speed' p2='100'/></p>");
		//console.log('setting speed');
		/* check for incoming request to client */
		/*parsedData = parsePacket(data.toString());
		wroteCustomResponse = false;
		for (var i=0; i < parsedData.length; i++) {
			var cmdResponse = runCommand(parsedData[i]);
			if(cmdResponse != false) {
				console.log('poach recieve');
				wroteCustomResponse = true;
				socket.write(cmdResponse);
			}
		}
		console.log(parsedData);
		if(wroteCustomResponse == false) {
			console.log('recieving raw: ' + data);
			socket.write(data);
		}*/
		socket.write(data);
	});
	client.on('end', function() {
		console.log(red + 'client disconnected' + reset);
	});
	client.on('error', function(error) {
		console.log('error-client: '+error);
	});
 
}).listen(5301);

function preparsePacket(packet) {
	parsePacket = packet.toString().replace('\u0000', '').split('\x01');
	console.log(parsePacket);
	if(parsePacket[0] == "GV") {
		if(parsePacket[1] == "_root.me.speed") {
			console.log('sending false speed');
			return "GV" + '\x01' + "_root.me.speed" +  + '\x01' + "15" + '\u0000';
		} else if(parsePacket[1] == "_root.map._xscale") {
			console.log('sending false xscale');
			return "GV" + '\x01' + "_root.map._xscale" +  + '\x01' + "50" + '\u0000';
		}
	}

	return packet;
}




/*
function runCommand(packet) {
	switch (packet[0]) {
		case 'GV':
			switch(packet[2]) {
				case '_root.me.speed':
					console.log('asking for speed');
					//return "GV" + '\x01' + "_root.me.speed"  + '\x01' + "15";
					return false;
				break;
				case '_root.map._xscale':
					console.log('asking for zoom');
					return false;
				break;
			}
		break;
	}
	return false;
}

function parsePacket(packet) {
	packet = packet.split('><').splice(1);
	packet.pop();
	
	parsedPacket = new Array();
	
	
	for(var i=0; i < packet.length; i++) {
		command = packet[i].split('=\'');
		command = command.splice(2,command.length);
		for(var x=0; x < command.length; x++) {
			command[x] = command[x].split('\'');
			command[x] = command[x][0];
		}
		parsedPacket.push(command);
	}
	
	return parsedPacket;
}
*/

 
// Put a friendly message on the terminal of the server.
console.log("MITM server running at port 5301\n");