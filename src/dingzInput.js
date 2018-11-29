module.exports = function(RED) {
  function dingzInput(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.device = RED.nodes.getNode(config.device);

    var helpers = require("../utils/helpers");
    var requests = require("../utils/requests");
    var deviceHelper = require("../utils/deviceListHelper");
    deviceHelper.startDeviceListener(node);
    this.DEVICE_TYPE = "dingz";
    helpers.setupNodeMacPairs(node);

    var taskJSON = getJsonFromProperty(
      this.device,
      config,
      node,
      this.DEVICE_TYPE
    );
    helpers.setupWiredListFromJSON(taskJSON, node);
    helpers.setupNodeMacPairs(node);
    requests.doAsync(back, this.DEVICE_TYPE, taskJSON, node);

    //EXECUTE REQUEST
    this.on("input", function(msg) {
      require("../utils/helpers").setupNodeMacPairs(node);
      var taskJSON;
      //BUTTON CLICK
      if (!msg.hasOwnProperty("payload")) {
        taskJSON = getJsonFromProperty(
          this.device,
          config,
          node,
          this.DEVICE_TYPE
        );
      }

      helpers.setupWiredListFromJSON(taskJSON, node);
      helpers.setupNodeMacPairs(node);
      requests.doAsync(back, this.DEVICE_TYPE, taskJSON, node);
    });
    return;

    //CALLBACK
    function back(str) {
      if (str["success"] == "false") {
        node.error("An error occured while sending");
      }
      node.send({
        payload: str
      });
    }

    // function getData(){
    //   var object = {}
    //   for(var i = 0; i < helpers.getButtonTypes();i++){
    //
    //   }
    // }

    function getJsonFromProperty(device, config, node, type) {
      taskJSON = {
        ip: device.host,
        mac: device.mac,
        request: config.request,
        data: {
          single: {
            url: config.advanced ? config.singleURL : "wire",
            "url-data": config.singleData
          },
          double: {
            url: config.advanced ? config.doubleURL : "wire",
            "url-data": config.doubleData
          },
          long: {
            url: config.advanced ? config.longURL : "wire",
            "url-data": config.longData
          }
        }
      };

      node.status({
        fill: "yellow",
        shape: "ring",
        text: "Using property"
      });

      if (!requests.isValid(taskJSON, type)) {
        node.error("Conversion from property to json failed");
      }

      return taskJSON;
    }

    //CLOSE
    this.on("close", function() {});
  }
  RED.nodes.registerType("dingz Input", dingzInput);

  RED.httpAdmin.post("/dingzInput", function(req, res) {
    var request = require("../utils/requests");
    req = req.body;

    var DEVICE_TYPE = "dingz";
    res.json(request.handleRequest(req, DEVICE_TYPE));
  });
};
