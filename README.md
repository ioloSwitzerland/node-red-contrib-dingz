![logo](misc/logo.png)

[![Build Status](https://travis-ci.com/ioloSwitzerland/node-red-contrib-dingz.svg?branch=master)](https://travis-ci.com/ioloSwitzerland/node-red-contrib-dingz)[![npm version](https://badge.fury.io/js/node-red-contrib-dingz.svg)](https://badge.fury.io/js/node-red-contrib-dingz)[![dependencies Status](https://david-dm.org/ioloSwitzerland/node-red-contrib-dingz/status.svg)](https://david-dm.org/ioloSwitzerland/node-red-contrib-dingz)[![Packagist](https://img.shields.io/npm/l/node-red-contrib-mystrom.svg?registry_uri=https%3A%2F%2Fregistry.npmjs.com)](https://github.com/ioloSwitzerland/node-red-contrib-dingz/blob/master/LICENSE)

[![NPM](https://nodei.co/npm/node-red-contrib-dingz.png?compact=true)](https://nodei.co/npm/node-red-contrib-dingz/)

### Features

- Control nodes via JSON input flows or by simply setting the values in the properties menu
- Automatic discovery of dingz devices
- Status message of how the message was sent or if device is reachable

### Installation

dingz-Node-RED was written in **Node.js** v4.2.6 and tested on Node-RED v0.19.4.

To use it execute `npm install node-red-contrib-dingz`.

### Bugs

Please report all bugs through the Github issues page. Your help is greatly appreciated.

### Nodes

- [dingz Input](#dingz-Input)
- [dingz Output](#dingz-Output)

---

#### dingz Input

![](misc/dingzInput.png)

Usage:

- Specify dingz Input device by providing ip and mac or using automatic discovery
- Connect devices to the output ports
- Press the button on the left side of the dingz input node to upload the configuration to the dingz devices.

#### dingz Output

![](misc/dingzOutput.png)

Usage:

- Specify which output should be set to what value
- Will run every time it gets any input.
