/**
 * OISC MITM
 * Copyright 2013 @nbar1
 *
 * Modify your local machine host files to point stage.ogreisland.com to your server
 */

net = require('net');
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
	console.log(socket.name + " initiated\n");

	socket.on('data', function (data) {
		console.log('client sending: ' + data);
		data = preparsePacket(data);
	  	client.write(data);
	});
	socket.on('error', function (error) {
		console.log('error-socket: '+error);
	});
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
			socket.write("<p c='1'><m p='2' p0='SV' p1='_root.me.speed' p2='100'/></p>");
			console.log('setting speed at 100');
		}, 10000);
	});
	client.on('data', function(data) {
		console.log(red + 'from oi: ' + reset + blue + data + reset);
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
console.log("OISC running on port 5301\n");