/**
 * Autominer module
 *
 * Handles all instances of automining
 */
module.exports = {
	/**
	 * targetRock: Current rock to mine
	 * canMine: Cooldown has completed
	 */
	targetRock: null,
	canMine: true,

	/**
	 * Checks if autominer is enabled
	 *
	 * @returns bool
	 */
	isEnabled: function() {
		return oisc.params.automine;
	},

	/**
	 * Moves character to next mining area
	 */
	moveToNextMineArea: function() {
		var moveCommand = "MOVE" + '\x01' + (oisc.coords.x - 99) + '\x01' + oisc.coords.y + '\x01' + oisc.coords.obj + '\u0000';
		oisc.client.write(moveCommand);
		oisc.coords.x = oisc.coords.x - 99;
	},

	/**
	 * Creates a new rock to mine
	 */
	createNewRock: function() {
		var createRockCommand = "SAY" + '\x01' + "/do csPreciousMetals" + '\u0000';
		oisc.client.write(createRockCommand);
	},

	/**
	 * Mine target rock
	 */
	mineRock: function() {
		var createRockCommand = "SAY" + '\x01' + "/do csIronOre" + '\u0000';
		oisc.client.write(createRockCommand);
	},

	/**
	 * Select rock
	 */
	selectRock: function(rock) {
		var createRockCommand = "CLICKOBJECT" + '\x01' + rock + '\u0000';
		oisc.client.write(createRockCommand);
	}
}