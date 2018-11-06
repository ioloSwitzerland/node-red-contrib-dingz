module.exports = function(RED) {

  function dingzOneInput(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    var helpers = require('../utils/helpers')
    var deviceHelper = require('../utils/deviceListHelper')

    deviceHelper.startDeviceListener();

    //EXECUTE REQUEST
    this.on("input", function(msg) {

    });
    return;

    //CALLBACK
    function back(str) {
      if (str["success"] == "false") {
        node.error("An error occured while sending")
      }
      node.send({ payload: str });
    }

    //CLOSE
    this.on('close', function() {});

  }
  RED.nodes.registerType("dingz One input", dingzOneInput);


  RED.httpAdmin.post("/dingz_buttons", function(req, res) {
    var request = require('../utils/requests')
    req = req.body
    var DEVICE_TYPE = 'button'
    res.json(request.handleRequest(req, DEVICE_TYPE))
  });

};