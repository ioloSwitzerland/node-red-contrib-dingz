module.exports = function(RED) {
  function dingzConfigOne(n) {
    RED.nodes.createNode(this, n)
    this.host = n.host
    this.mac = n.mac.toUpperCase()
  }

  RED.nodes.registerType("dingz Config One", dingtConfigOne);

  RED.httpAdmin.get("/devices/list", function(req, res) {
    var deviceHelper = require('../utils/deviceListHelper')
    var helpers = require('../utils/helpers')

    //get device list
    var deviceList = helpers.getDeviceList()

    //Start listener if not already running
    var listenerState = helpers.getListernerState()
    if (!listenerState) {
      deviceHelper.deviceListener()
    }

    res.json(deviceList)
  })

}

//firewall has to let inbound port 7979 through