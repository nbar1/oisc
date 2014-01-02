# Ogre Island Super Client NJS

Ogre Island Super Client NJS is an Ogre Island Super Client (OISC) clone built in node.js

## Current implementations

* Increased character speed - /speed <val>
* Access bank anywhere - /bank
* Open windows - /oisc open <window>
* Set flash variables via /oisc set <var> <value>
* Automatically loots any coins

## Future implementations

* Automatic looting
* Sell anywhere
* Automatic casting

## Installation

* Make sure node.js is installed on your local machine or server
* Modify your localmachine hostfile to point `www.ogreisland.com` to `localhost` or your server IP, depending on where you're running node.js
* Since we need to proxy www.ogreisland.com, you must not have anything using port 80 or 5301 on your server. This includes Apache.

## Using OISC NJS

* Run `sudo node ogreisland.js` on your local machine or server
* Launch Ogre Island
* When you're done, make sure you stop the node.js server!