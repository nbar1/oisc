/**
 * Outbound parser module
 *
 * Handles all outgoing packets from game client
 * and modifies them if needed
 */
module.exports = {
	/**
	 * Get character by account id
	 */
	parsePacket: function(packet, callback) {
		console.log('parsing: ' + packet.toString().replace('\u0000', '[end]').split('\x01').join('[split]'));
		parsePacket = packet.toString().replace('\u0000', '').split('\x01');
		switch(parsePacket[0])
		{
			case 'SAY':
				parseSay = parsePacket[1].split(' ');
				switch(parseSay[0].toLowerCase()) {
					case "/oisc":
						switch(parseSay[1].toLowerCase())
						{
							case "set":
								callback(true, 'client', "<p c='2'><m p='2' p0='SV' p1='_root."+parseSay[2]+"' p2='"+parseSay[3]+"'/><m p='3' p0='SAY' p1='OISC' p2='Setting " + parseSay[2] + " to " + parseSay[3] + "' p3=''/></p>");
								break;
	
							case "get":
								callback(true, 'client', "<p c='1'><m p='3' p0='SAY' p1='OISC' p2='Getting " + parseSay[2] + "' p3=''/></p>");
								break;
	
							case "open":
								callback(true, 'client', "<p c='1'><m p='1' p0='OPENWINDOW' p1='" + parseSay[2] + "'/></p>");
								break;

							case "param":
								if(typeof oisc.params[parseSay[2]] == "boolean") {
									oisc.params[parseSay[2]] = !oisc.params[parseSay[2]];
								}
								else {
									oisc.params[parseSay[2]] = parseSay[3];
								}
								callback(true, 'client', "<p c='1'><m p='3' p0='SAY' p1='OISC' p2='" + parseSay[2] + " is now " + oisc.params[parseSay[2]] + "' p3=''/></p>");
								break;
						}
						break;

					case "/speed":
						callback(true, 'client', "<p c='2'><m p='2' p0='SV' p1='_root.me.speed' p2='"+parseSay[1]+"'/><m p='3' p0='SAY' p1='OISC' p2='Speed is now " + parseSay[1] + "' p3=''/></p>");
						oisc.config.speed = parseSay[1];
						break;

					case "/coords":
						callback(true, 'client', "<p c='1'><m p='3' p0='SAY' p1='OISC' p2='Coords: " + oisc.coords.x + " " + oisc.coords.y + " " + oisc.coords.z + " " + oisc.coords.obj + "' p3=''/></p>");
						break;

					case "/autocast":
						if(oisc.params.autocast == true) {
							oisc.params.autocast = false;
							oisc.params.autocast_set = false;
							callback(true, 'client', "<p c='1'><m p='2' p0='SAY' p1='*' p2='Autocast disabled'/></p>");
						}
						else {
							oisc.params.autocast = true;
							oisc.params.autocast_set = true;
							callback(true, 'client', "<p c='1'><m p='2' p0='SAY' p1='*' p2='Select spell to autocast'/></p>");
						}
						break;

					case "/automine":
						if(oisc.params.automine == true) {
							oisc.params.automine = false;
							callback(true, 'client', "<p c='1'><m p='2' p0='SAY' p1='*' p2='Autominer disabled'/></p>");
						}
						else {
							oisc.params.automine = true;
							callback(true, 'client', "<p c='1'><m p='2' p0='SAY' p1='*' p2='Autominer enabled'/></p>");
							autominer.createNewRock();
						}
						break;

					case "/do":
						if(oisc.params.autocast_set) {
							oisc.params.autocast_spell = parseSay[1];
							oisc.params.autocast_set = false;
							callback(true, 'client', "<p c='1'><m p='2' p0='SAY' p1='*' p2='Autocast set to " + parseSay[1] + "'/></p>");
							
						}
						else if(oisc.params.autocast && !oisc.config.autocast_active && parseSay[1].toLowerCase() == oisc.params.autocast_spell.toLowerCase()) {
							// Casted the autocast spell, start autocast
							oisc.config.autocast_active = true;
							callback(true, 'server', packet);
						}
						else {
							callback(true, 'server', packet);
						}
						break;

					case "/cmd":
						parseSay.splice(0,1);
						var command = parseSay.join(' ').split('|').join('\x01');
						callback(true, 'server', command);
						break;

					default:
						callback(true, 'server', packet);
						break;
				}
				break;

			case 'GV':
				if(parsePacket[1] == "_root.me.speed") {
					callback(true, 'server', "GV" + '\x01' + "_root.me.speed" + '\x01' + oisc.config.speed_server + '\u0000');
				}
				break;
			case 'MOVE':
				oisc.coords.x = parsePacket[1];
				oisc.coords.y = parsePacket[2];
				oisc.coords.obj = parsePacket[3];
				callback(true, 'server', packet);
				break;
			default:
				callback(true, 'server', packet);
				break;
		}
	}
}