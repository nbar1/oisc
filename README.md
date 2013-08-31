# Ogre Island Super Client NJS

Ogre Island Super Client NJS is an Ogre Island Super Client (OISC) clone built in node.js

## Current implementations

* Increased character speed - /speed <val>
* Variable zoom - /zoom [50-200]
* Access bank anywhere - /bank
* Open windows - /oisc open <window>
* Set flash variables via /oisc set <var> <value>

## Future implementations

* Increased zoom (It seems there are checks against this, may not implement)
* Automatic retaliation
* Automatic looting
* Sell anywhere

## Installation

* Make sure node.js is installed on your local machine or server
* Modify your localmachine hostfile to point `stage.ogreisland.com` to `localhost` or your server IP, depending on where you're running node.js

## Using OISC NJS

* Run `node ogreisland.js` on your local machine or server
* Launch Ogre Island
* When you're done, make sure you stop the node.js server!