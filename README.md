# Ogre Island Super Client

Ogre Island Super Client is a proxy for Ogre Island that allows for increased functionality.

## Latest Changes
* Removed /bank command since the bank is now in html5
** No plans to reinstate command, as I believe it requires vendor vicinity

## Current implementations

* Automatically cast after first cast of specified spell - /autocast
* Increased character speed - /speed *value*
* Access bank anywhere - /bank
* Automatically loots any items, or just coins - /oisc param [loot_all, loot_coins]
* Maintain set speed while over weight limit - /speed *value*
* Set flash variables - /oisc set *variable* *value*

## Future implementations

* Sell anywhere
* Automining
* Autolumberjack

## Installation

* Ensure node.js is installed on your server.
* Modify your local machines hostfile to point `www.ogreisland.com` to your server IP.
* Since we need to proxy www.ogreisland.com, you must not have anything using port 80 or 5301 on your server. This includes Apache. Hopefully there is a better way around this.

## Using OISC

* Run `sudo node oisc.js` on your local machine or server.
* Launch Ogre Island.
* When you're done, make sure you stop the node.js server!

## Important Information
Use of this application is against the terms and conditions of your Ogre Island account. There is a good chance, if found out that you're using it, your account will be banned. I am in no way responsible for anything that may happen to you, your character or your account should you decide to use this application.
