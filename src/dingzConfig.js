module.exports = function(RED) {
  function dingzConfig(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.mac = n.mac.toUpperCase();
    this.name = n.name;
  }

  RED.nodes.registerType("dingz Config", dingzConfig);

  RED.httpAdmin.get("/devices/list/dingz", function(req, res) {
    var deviceHelper = require("../utils/deviceListHelper");
    var helpers = require("../utils/helpers");

    //get device list
    var deviceList = helpers.getDeviceList();

    res.json(deviceList);
  });
};
