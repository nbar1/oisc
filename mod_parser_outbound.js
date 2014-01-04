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
						callback(true, 'client', "<p c='2'><m p='2' p0='SV' p1='_root.me.speed' p2='"+parseSay[1]+"'/><m p='3' p0='SAY' p1='OISC' p2='Setting me.speed to " + parseSay[1] + "' p3=''/></p>");
						break;

					case "/bank":
						callback(true, 'client', "<p c='1'><m p='1' p0='OPENWINDOW' p1='bank'/></p>");
						break;

					case "/do":
						if(oisc.params.autocast && !oisc.config.autocast_active && parseSay[1].toLowerCase() == oisc.params.autocast_spell.toLowerCase()) {
							// Casted the autocast spell, start autocast
							oisc.config.autocast_active = true;
						}
						callback(true, 'server', packet);
						break;

					case "/cmd":
						parseSay.splice(0);
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
					callback(true, 'server', "GV" + '\x01' + "_root.me.speed" + '\x01' + "15" + '\x01' + "GV" + '\x01' + "_root.map._xscale" + '\x01' + "50" + '\u0000');
				}
				break;

			default:
				callback(true, 'server', packet);
				break;
		}
	}
}