var helpers = require("../utils/helpers");
var http = require("http");

module.exports = {
  doAsync: function(callback, type, taskJSON, node) {
    var debug = false;
    var emulateDevcies = false;

    ip = taskJSON["ip"];

    var resolvedArray = helpers.getPathAndData(type, taskJSON, node);
    pathResolved = resolvedArray[0];
    dataResolved = resolvedArray[1];

    //TODO remove this
    var sendHackFlag = true;

    if (sendHackFlag) {
      var interactions = helpers.getButtonInteractions();

      for (var i = 0; i < dataResolved.length; i++) {
        var data = "";
        var pathSuffix = "";

        for (var j = 0; j < dataResolved[0].length; j++) {
          var beginString = interactions[j] + "=";
          var index = dataResolved[i][j].indexOf(beginString);
          if (index > -1) {
            pathSuffix = "/btn" + i.toString() + "/" + interactions[j];

            data = dataResolved[i][j].substring(
              index + beginString.length,
              dataResolved[i][j].length
            );
          }

          var http = require("http");
          var body = "";
          var options = {
            host: ip,
            path: pathResolved + pathSuffix,
            port: emulateDevcies ? "8080" : "80"
          };

          options.method = "POST";
          options.headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": data.length
          };

          var req = http.request(options, response => {
            // Continuously update stream with data
            response.on("data", function(d) {
              body += d;
            });
            response.on("end", function() {
              var json = helpers.messageToJson(body);
              callback(json);
            });
          });

          if (data.length > 0) {
            req.write(data);
          }

          req.on("error", function(err) {
            var json = helpers.messageToJson(body);
            callback(json);
          });

          req.end();

          if (debug) {
            node.log(
              "\nDEVICE TYPE: " +
                type +
                "\nREQUEST TYPE: " +
                options.method +
                "\nDATA SENT: " +
                data +
                "\nADDRESS: " +
                ip +
                pathResolved +
                "/" +
                interactionTypes[i] +
                "\n"
            );
          }
        }
      }
    }
  },

  isValid: function(json, type) {
    var hasIP = json.hasOwnProperty("ip");
    var hasMAC = json.hasOwnProperty("mac");
    var hasRequest = json.hasOwnProperty("request");

    var basics = hasIP && hasMAC && hasRequest;

    if (type == "dingz") {
      if (json["request"] == "set") {
        var isValid = true;
        for (var i = 0; i < helpers.getNumberOfInputs(); i++) {
          var hasSingle = false;
          var hasDouble = false;
          var hasLong = false;

          var data = json.hasOwnProperty("data");
          var current = data.hasOwnProperty(i.toString());

          if (
            json.hasOwnProperty("data") &&
            json.data.hasOwnProperty(i.toString())
          ) {
            hasSingle = json.data[i.toString()].hasOwnProperty("single");
            hasSingle &= json.data[i.toString()]["single"].hasOwnProperty(
              "url"
            );

            hasDouble = json.data[i.toString()].hasOwnProperty("double");
            hasDouble &= json.data[i.toString()]["double"].hasOwnProperty(
              "url"
            );

            hasLong = json.data[i.toString()].hasOwnProperty("long");
            hasLong &= json.data[i.toString()]["long"].hasOwnProperty("url");
          }

          isValid &= basics && (hasSingle || hasDouble || hasLong);
        }

        return isValid;
      } else {
        return basics;
      }
    }
  },

  handleRequest: function(req, DEVICE_TYPE) {
    var buttonActions = helpers.getButtonInteractions();
    var buttonText = helpers.getButtonTexts();

    //check if wire
    if (req.hasOwnProperty("mac") && req.hasOwnProperty("action")) {
      var buttonList = helpers.getWiredList();

      //TODO
      console.log(buttonList);
      console.log(req);

      for (var button of buttonList) {
        console.log(button.actions[0][2]);
        console.log(req.action);
        if (
          !isNaN(req.action) &&
          !isNaN(req.button) &&
          parseInt(req.action) < buttonActions.length &&
          parseInt(req.button) < buttonText.length &&
          button.actions[req.button][req.action] &&
          button.mac == req.mac
        ) {
          var messages = new Array(
            buttonActions.length * buttonText.length + 1
          ).fill(null);

          var actionReportOffset = parseInt(req.action) + 1;
          var buttonIndex = parseInt(req.button);

          messages[buttonIndex * 3 + actionReportOffset] = {
            payload:
              helpers.getButtonTexts()[buttonIndex] +
              " Button: " +
              helpers.getButtonInteractions()[req.action] +
              " click"
          };

          var node = helpers.getNodeForMac()[req.mac];

          node.send(messages);
          return "executed successfully";
          break;
        }
      }
    } else {
      console.log("Faulty request sent: " + req);
    }
  }
};
