module.exports = function(RED) {
  function dingzOutput(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.device = RED.nodes.getNode(config.device);
    var helpers = require("../utils/helpers");
    var requests = require("../utils/requests");
    var deviceHelper = require("../utils/deviceListHelper");
    deviceHelper.startDeviceListener(node);

    this.DEVICE_TYPE = "dingz";

    //EXECUTE REQUEST
    this.on("input", function(msg) {
      var taskJSON = msg["payload"];

      this.status({
        fill: "blue",
        shape: "ring",
        text: "Using json"
      });

      if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
        taskJSON = {
          ip: this.device.host,
          mac: this.device.mac,
          request: config.request != "output" ? "output" : config.request
        };

        var data = {};
        if (!config.zeroIsShade) {
          if (!config.changeDimmerZero) {
            data.outputZero = config.outputZero;
          }
          if (!config.changeDimmerOne) {
            data.outputOne = config.outputOne;
          }
        } else {
          if (!config.changeShadeZero) {
            data["shadeZero"] = {
              blind: config.shadeZeroBlind,
              lamella: config.shadeZeroLamella
            };
          }
        }

        if (!config.oneIsShade) {
          if (!config.changeDimmerTwo) {
            data.outputTwo = config.outputTwo;
          }
          if (!config.changeDimmerThree) {
            data.outputThree = config.outputThree;
          }
        } else {
          if (!config.changeShadeOne) {
            data["shadeOne"] = {
              blind: config.shadeOneBlind,
              lamella: config.shadeOneLamella
            };
          }
        }

        taskJSON.data = data;
        this.status({
          fill: "yellow",
          shape: "ring",
          text: "Using property"
        });

        if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
          node.error("Conversion from property to json failed");
        }
      }

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

    //CLOSE
    this.on("close", function() {});
  }
  RED.nodes.registerType("dingz Output", dingzOutput);
};
