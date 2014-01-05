/**
 * Outbound parser module
 *
 * Handles all incoming packets from game server
 * and modifies them if needed
 */
module.exports = {
	/**
	 * Parse full packet
	 */
	parsePacket: function(packet, callback) {
		var self = this;
		var packets = this.getAllPackets(packet);

		// return if packet is null
		if(packets == null) return;

		// loop thru and get each packets zones
		packets.forEach(function(pck) {
			zones = self.getPacketZones(pck);
			callback(true, 'client', self.executePacket(packet, zones));
		});
	},
	/**
	 * Break up large packet into individual packets
	 */
	getAllPackets: function(packet) {
		return packet.toString().match(/<m (.+?)\/>/g);
	},

	/**
	 * Break up single packet into individual zones
	 */
	getPacketZones: function(packet) {
		var stripped_zones = [];
		var zones = packet.toString().match(/p\d='(.+?)'/g);
		zones.forEach(function(zone) {
			zone = zone.replace(/p\d='(.+?)'/, "$1");
			stripped_zones.push(zone);
		});
		return stripped_zones;
	},

	/**
	 * Execute packet
	 */
	executePacket: function(packet, zones) {
		switch(zones[0]) {
			case 'ADDTOBAG':
				if(zones[1] == 'loot') {
					return this.checkLoot(packet, zones);
				}
				break;
			case 'SETCOOLDOWN':
				// Check cooldown for autocast
				if(oisc.params.autocast && oisc.config.autocast_active && zones[1] == oisc.params.autocast_spell && zones[2] == '1') {
					// Cooldown at 1 second, start timeout for cast
					var autocastCooldownDelay = setTimeout(function(){
						oisc.client.write("SAY" + '\x01' + "/do " + oisc.params.autocast_spell + '\u0000');
						delete autocastCooldownDelay;
					}, oisc.params.autocast_delay);
				}
				return packet;
				break;
			case 'SAY':
				// Check auto cast
				if(oisc.config.autocast_active && zones[1] == '**' && zones[2].indexOf('You have slain') != -1) {
					oisc.config.autocast_active = false;
				}
				return packet;
				break;
			default:
				return packet;
				break;
		}
	},

	/**
	 * Check for loot
	 */
	checkLoot: function(packet, zones) {
		self = this;
		// split loot individually
		var loot = zones[2].split(';');
		loot.pop();
		loot.forEach(function(item) {
			item_id = item.split(',');
			item_id = item_id[0];
			// check config to loot all or just coins
			if(oisc.params.loot_all === true) {
				self.grabLoot(item_id);
			}
			else if(oisc.params.loot_coins === true && item.indexOf('Coins') != -1) {
				self.grabLoot(item_id);
			}
		});
		return packet;
	},

	/**
	 * Grab loot
	 */
	grabLoot: function(item_id) {
		oisc.client.write("CLICKBAGITEM" + '\x01' + "loot" + '\x01' + item_id + '\u0000');
		oisc.client.write("SAY" + '\x01' + "///CLICKBAG[!]bag[!]10[!]10" + '\u0000');
	}
}