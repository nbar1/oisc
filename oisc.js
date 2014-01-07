/**
 * OISC MITM
 * Modify your local machine host files to point www.ogreisland.com to your server address
 */

console.log('OISC running...');

// Load the packet parser
var parser_outbound = require('./mod_parser_outbound');
var parser_inbound = require('./mod_parser_inbound');

// Load the TCP Library
net = require('net');
http = require('http');

// Set colors for console output
var red, blue, reset;
red = '\033[31m';
blue = '\033[34m';
reset = '\033[0m';

// Map oisc to global
oisc = {};
oisc.config = {
	host: 'www.ogreisland.com',
	port: 5301,
	autocast_active: false,
	speed: 15
};
oisc.params = {
	autocast: false,
	autocast_spell: '',
	autocast_delay: 800,
	loot_all: true,
	loot_coins: true
};

/**
 * Create server for game client to connect to
 */
net.createServer(function(socket) {
	// Map the socket to global
	oisc.server = socket;

	// Alert of established connection
	console.log('OISC server connection from game client established');

	// Start a client to connect to OI server
	if(oisc.client === undefined || oisc.client.writeable !== true) startClient();

	/**
	 * Receive data from game client
	 */
	oisc.server.on('data', function(data) {
		console.log(red + 'SERVER RECEIVED: ' + reset + blue + data + reset);
		parser_outbound.parsePacket(data, function(send, receiver, packet) {
			if(send !== false) {
				if(receiver === 'client') {
					console.log('sending to gameclient: ' + packet);
					oisc.server.write(packet);
				}
				else if(receiver === 'server') {
					console.log('sending to gameserver: ' + packet);
					oisc.client.write(packet);
				}
			}
			else {
				console.log('not sending: ' + data);
			}
		});
	});

	/**
	 * Error on OISC server
	 */
	oisc.server.on('error', function (error) {
		console.log(red + 'SERVER ERROR: ' + reset);
		console.log(error.stack);
	});

	/**
	 * Game client disconnect
	 */
	oisc.server.on('end', function() {
		console.log(red + 'SERVER CONNECTION ENDED' + reset);
		oisc.client.destroy();
	});
	
}).listen(oisc.config.port);

/**
 * Create client to connect to OI server
 */
function startClient() {
	/**
	 * Open connection to OI server
	 */
	oisc.client = net.createConnection({port: oisc.config.port, host: oisc.config.host}, function() {
		console.log(red + 'CLIENT: ' + reset + blue + 'Connected to ' + oisc.config.host + ':' + oisc.config.port + reset);
	});

	/**
	 * Receive data from OI server
	 */
	oisc.client.on('data', function(data) {
		console.log(red + 'CLIENT RECEIVED: ' + reset + blue + data + reset);
		oisc.server.write(data);
		parser_inbound.parsePacket(data, function(send, receiver, packet) {
			
		});
	});

	/**
	 * Error on OISC client
	 */
	oisc.client.on('error', function(error) {
		console.log('OISC Client Error: ' + error.stack);
	});

	/**
	 * OI Server disconnect
	 */
	oisc.client.on('end', function() {
		console.log(red + 'CLIENT CONNECTION ENDED' + reset);
	});
}

/**
 * Proxy for port 80
 *
 * We need this because as of 12/2013 the game server hits
 * www.ogreisland.com instead of stage.ogreisland.com, so our
 * hostfile entry would kill the OI website without proxy.
 */
http.createServer(function(request, response) {
	var proxy = http.createClient(80, request.headers['host']);
	var proxy_request = proxy.request(request.method, request.url, request.headers);
	proxy_request.addListener('response', function(proxy_response) {
		proxy_response.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});
		proxy_response.addListener('end', function() {
			response.end();
		});
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
}).listen(80);
