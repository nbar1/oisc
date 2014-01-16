/**
 * Outbound parser module
 *
 * Handles all incoming packets from game server
 * and modifies them if needed
 */
module.exports = {
	/**
	 * Parse full packet
	 *
	 * @param packet Full packet being examined
	 * @param callback
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
	 *
	 * @param packet Full packet being examined
	 * @returns array Individual packets
	 */
	getAllPackets: function(packet) {
		return packet.toString().match(/<m (.+?)\/>/g);
	},

	/**
	 * Break up single packet into individual zones
	 * @param packet Individual packet being examined
	 * @returns array Packet zones
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
	 *
	 * @param packet Individual packet being examined
	 * @param zones Packet zones
	 * @returns string Individual packet
	 */
	executePacket: function(packet, zones) {
		switch(zones[0]) {
			case 'ADDTOBAG':
				if(zones[1] == 'loot2') {
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
				else if(oisc.config.speed != '' && zones[2].indexOf('too much weight') != -1) { // Check for weight overload
					var setSpeedBack = setTimeout(function() { oisc.server.write("<p c='1'><m p='2' p0='SV' p1='_root.me.speed' p2='" + oisc.config.speed + "'/></p>"); }, 500);
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
	 *
	 * @param packet Individual packet being examined
	 * @param zones Packet zones
	 * @returns string Individual packet
	 */
	checkLoot: function(packet, zones) {
		self = this;
		// split loot individually
		var loot = zones[2].split(';');
		loot.pop();
		loot.forEach(function(item) {
			item = item.split(',');
			item_id = item[0];
			item_specs = item[item.length-1].split(' - ');
			item_name = item_specs[0].trim();

			if(oisc.params.loot_coins == true && item_name.indexOf('Coins') != -1) {
				// grab coins
				self.grabLoot(item_id);
			}
			else if(oisc.params.loot_all === true) {
				// check value of item, grab if over loot_value
				if(item_specs.length < 3) {
					item_quality = 'none';
					item_value = item_specs[1].replace(/[^\d.]/g, "");
				}
				else {
					item_quality = item_specs[1].replace("quality: ", "");
					item_value = item_specs[2].replace(/[^\d.]/g, "");
				}
				if(item_value >= oisc.params.loot_value) {
					self.grabLoot(item_id);
				}
			}
		});
		return packet;
	},

	/**
	 * Grab loot
	 *
	 * @param item_id ID of item to grab
	 */
	grabLoot: function(item_id) {
		oisc.client.write("CLICKBAGITEM" + '\x01' + "loot" + '\x01' + item_id + '\u0000');
	}
}