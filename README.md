# Ogre Island Super Client

Ogre Island Super Client is a proxy for Ogre Island that allows for increased functionality.


## Current implementations

* Increased character speed - /speed <val>
* Access bank anywhere - /bank
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

* Run `sudo node oisc.js` on your local machine or server
* Launch Ogre Island
* When you're done, make sure you stop the node.js server!

## Important Information
Use of this application is against the terms and conditations of your Ogre Island account. There is a good chance, if found out that you're using it, your account will be banned. I am in no way responsible for anything that may happen to you, your character or your account should you decide to use this application.