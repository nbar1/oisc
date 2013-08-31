/**
 * OISC MITM
 * Modify your local machine host files to point stage.ogreisland.com to your server
 */

// Load the TCP Library
net = require('net');

// Set colors for console output
var red, blue, reset;
red = '\033[31m';
blue = '\033[34m';
reset = '\033[0m';

// Map oisc to global
GLOBAL.oisc = GLOBAL;

// Build clients list
var clients = [];

// Create OISC Server
// Accepts incoming connections from game client
oisc.server = net.createServer(function (socket) {
	// Scope to global
	oisc.socket = socket;
	// Set name
	oisc.socket.name = oisc.socket.remoteAddress + ':' + oisc.socket.remotePort;
	// Set keepalive
	oisc.socket.setKeepAlive(true, 120000);
	// Put game client in the clients list
	clients.push(oisc.socket);

	console.log('OISC Server ' + oisc.socket.remotePort + ' initiated: ' + oisc.socket.name + '\n');
	// Start OISC Client

	// Handle incoming messages from game client
	oisc.socket.on('data', function (data) {
		parsedData = parseGameClientPacket(data);
		if(oisc.client == undefined && parsedData != false) setupClient();
		if(parsedData !== false && parsedData !== true) {
			console.log('Game client sending: ' + parsedData);
			// Write data to OISC Client
			oisc.client.write(data);
		} else {
			console.log('OISC Server tossing: ' + data);
		}
	});
	// Handle errors
	oisc.socket.on('error', function (error) {
		console.log('OISC Server ' + oisc.socket.remotePort + ' Error: '+error.stack);
	});
	// Remove the client from the list when it leaves
	oisc.socket.on('end', function () {
		clients.splice(clients.indexOf(oisc.socket), 1);
		console.log('OISC Server ' + oisc.socket.remotePort + ': ' + oisc.socket.name + ' GAME CLIENT DISCONNECT.\n');
	});
	// Pipe commands 
	oisc.socket.pipe(oisc.socket);
}).listen(5301);


// Set up OISC Client
// Connects to OI server
function setupClient() {
	oisc.client = net.createConnection({port: 5301, host:'stage.ogreisland.com'}, function() { //'connect' listener
		console.log('OISC Client initiated: connected to stage.ogreisland.com:5301');
	});
	oisc.client.on('data', function(data) {
		console.log(red + 'OISC Client recieved from OI: ' + reset + blue + data + reset);
		oisc.socket.write(data);
	});
	oisc.client.on('end', function() {
		console.log(red + 'OISC Client: SERVER DISCONNECT' + reset);
		oisc.socket.destroy();
	});
	oisc.client.on('error', function(error) {
		console.log('OISC Client Error: ' + error.stack);
	});
}

// Handle parsing for packets sent out by game client
function parseGameClientPacket(packet) {
	console.log('parsing: '+packet);
	parsePacket = packet.toString().replace('\u0000', '').split('\x01');
	switch(parsePacket[0])
	{
		case '<policy-file-request/>':
			return false;
			break;

		case 'SAY':
			parseSay = parsePacket[1].split(' ');
			switch(parseSay[0]) {
				case "/oisc":
					switch(parseSay[1])
					{
						case "set":
							oisc.socket.write("<p c='2'><m p='2' p0='SV' p1='_root."+parseSay[2]+"' p2='"+parseSay[3]+"'/><m p='3' p0='SAY' p1='OISC' p2='Setting " + parseSay[2] + " to " + parseSay[3] + "' p3=''/></p>");
							return true;
						break;
	
						case "get":
							oisc.socket.write("<p c='1'><m p='3' p0='SAY' p1='OISC' p2='Getting " + parseSay[2] + "' p3=''/></p>");
							return true
						break;
						
						case "open":
							oisc.socket.write("<p c='1'><m p='1' p0='OPENWINDOW' p1='" + parseSay[2] + "'/></p>");
							return true;
					}
					break;
				case "/zoom":
					oisc.socket.write("<p c='3'><m p='2' p0='SV' p1='_root.map._xscale' p2='"+parseSay[1]+"'/><m p='2' p0='SV' p1='_root.map._yscale' p2='"+parseSay[1]+"'/><m p='3' p0='SAY' p1='OISC' p2='Zooming to " + parseSay[1] + "' p3=''/></p>");
					return true;
					break;
				case "/speed":
					oisc.socket.write("<p c='2'><m p='2' p0='SV' p1='_root.me.speed' p2='"+parseSay[1]+"'/><m p='3' p0='SAY' p1='OISC' p2='Setting me.speed to " + parseSay[1] + "' p3=''/></p>");
					return true;
					break;
				case "/vendor":
					oisc.client.write("CLICKPLAYER" + '\x01' + "9295809e-a7e5-46bf-b077-418ddc4e12b7" + '\u0000');
					oisc.client.write("SAY" + '\x01' + "///VENDORSELLBUTTON" + '\u0000');
					return true;
			}
			break;

		case 'GV':
			if(parsePacket[1] == "_root.me.speed") {
				console.log('sending false speed');
				return "GV" + '\x01' + "_root.me.speed" + '\x01' + "15" + '\x01' + "GV" + '\x01' + "_root.map._xscale" + '\x01' + "50" + '\u0000';
			}
			break;
	}
	return packet;
}
