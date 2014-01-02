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
			default:
				return packet;
		}
	},

	/**
	 * Check for loot
	 *
	 * Maybe this should pick up all loot?
	 * limited to coins right now
	 */
	checkLoot: function(packet, zones) {
		// split loot individually
		var loot = zones[2].split(';');
		loot.pop();
		loot.forEach(function(item) {
			item_id = item.split(',');
			item_id = item_id[0];
			if(item.indexOf('Coins') != -1) {
				oisc.client.write("CLICKBAGITEM" + '\x01' + zones[1] + '\x01' + item_id + '\u0000');
				oisc.client.write("SAY" + '\x01' + "///CLICKBAG[!]bag[!]10[!]10" + '\u0000');
			}
		});
		return packet;
	}
}