var http = require("http");
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

    //EXECUTE REQUEST
    this.on("input", msg => {
      require("../utils/helpers").setupNodeMacPairs(node);
      var taskJSON;
      //BUTTON CLICK
      if (!msg.hasOwnProperty("payload")) {
        if (helpers.getDevice(this.device.mac) == null) {
          node.status({
            fill: "red",
            shape: "ring",
            text: "dingz unreachable" + helpers.getDateString()
          });

          node.error(
            "UNREACHABLE: dingz " +
              config.name +
              " with " +
              this.device.host +
              "@" +
              this.device.mac
          );
        }

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
      if (str["success"] == false) {
        node.error("An error occured while sending");
        node.status({
          fill: "red",
          shape: "ring",
          text: "dingz unreachable"
        });
      } else if (str["success"] == true) {
        node.status({
          fill: "green",
          shape: "dot",
          text: "Updated" + helpers.getDateString()
        });
      }

      // node.send({
      //   payload: str
      // });
    }

    function updateDingzState(ip) {
      http
        .get("http://" + ip + "/info", res => {
          this.prevStateConnected = true;
          node.status({
            fill: "green",
            shape: "dot",
            text: "dingz reachable"
          });
          if (this.connected != undefined) {
            this.connected = true;
          }
        })
        .on("error", e => {
          this.prevStateConnected = false;

          node.status({
            fill: "red",
            shape: "ring",
            text: "dingz unreachable"
          });
          if (this.connected != undefined) {
            this.connected = false;
          }
        })
        .on("timeout", () => {
          if (!this.prevStateConnected) {
            node.status({
              fill: "red",
              shape: "ring",
              text: "dingz unreachable"
            });
            if (this.connected != undefined) {
              this.connected = false;
            }
          }

          this.prevStateConnected = false;
        })
        .setTimeout(1000);
    }

    function getJsonFromProperty(device, config, node, type) {
      data = {};

      var textArray = helpers.getButtonTexts();

      for (var i = 0; i < helpers.getNumberOfInputs(); i++) {
        var currentButton = textArray[i];
        var entireButton = {};
        for (var j = 0; j < helpers.getButtonInteractions().length; j++) {
          var interaction = helpers.getButtonInteractions()[j];

          var temp = {
            url:
              config.advanced && config["show" + currentButton]
                ? config[interaction + "URL" + currentButton]
                : "wire",
            "url-data": config[interaction + "Data" + currentButton]
          };
          entireButton[interaction] = temp;
        }
        data[i.toString()] = entireButton;
      }

      taskJSON = {
        ip: device.host,
        mac: device.mac,
        request: config.request,
        data: data
      };

      if (!requests.isValid(taskJSON, type)) {
        node.error("Conversion from property to json failed");
      }

      return taskJSON;
    }

    //CLOSE
    this.on("close", function() {});
  }
  RED.nodes.registerType("dingz Input", dingzInput);

  RED.httpAdmin.post(
    "/inject/:id",
    RED.auth.needsPermission("inject.write"),
    function(req, res) {
      var node = RED.nodes.getNode(req.params.id);
      if (node != null) {
        try {
          node.receive();
          res.sendStatus(200);
        } catch (err) {
          res.sendStatus(500);
          node.error(RED._("inject.failed", { error: err.toString() }));
        }
      } else {
        res.sendStatus(404);
      }
    }
  );

  RED.httpAdmin.post("/dingzInput", function(req, res) {
    console.log("GOT REQUEST");
    var request = require("../utils/requests");
    req = req.body;

    var DEVICE_TYPE = "dingz";
    res.json(request.handleRequest(req, DEVICE_TYPE));
  });
};
