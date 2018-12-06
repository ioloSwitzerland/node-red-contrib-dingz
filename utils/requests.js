var helpers = require("../utils/helpers");
var http = require("http");

module.exports = {
  doAsync: function(callback, type, taskJSON, node) {
    var resolvedArray = helpers.getPathAndData(
      type,
      taskJSON,
      node,
      module.exports.doAsyncCallback,
      callback
    );
  },

  doAsyncCallback: function(resolvedArray, taskJSON, finallyCallback) {
    if (resolvedArray == "error") {
      finallyCallback({ success: false });
    } else if (
      resolvedArray == null ||
      resolvedArray[0] == null ||
      resolvedArray[0].length == 0
    ) {
      //NOTHING HAS CHANGED
      finallyCallback({ success: true, changed: false });
      return;
    }

    var debug = false;
    ip = taskJSON["ip"];

    var pathResolved = resolvedArray[0];
    var dataResolved = resolvedArray[1];

    //TODO remove this
    var sendHackFlag = true;

    if (sendHackFlag) {
      for (var i = 0; i < dataResolved.length; i++) {
        for (var j = 0; j < dataResolved[i].length; j++) {
          var body = "";
          var options = {
            host: ip,
            path: pathResolved[i][j],
            port: "80"
          };

          options.method = "POST";
          options.headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": dataResolved[i][j].length
          };

          var req = http.request(options, response => {
            // Continuously update stream with data
            response.on("data", function(d) {
              body += d;
            });
            response.on("end", function() {
              var json = helpers.messageToJson(body);
              finallyCallback(json);
            });
          });

          if (dataResolved[i][j].length > 0) {
            req.write(dataResolved[i][j]);
          }

          req.on("error", function(err) {
            var json = helpers.messageToJson(body);
            finallyCallback(json);
          });

          req.end();

          if (debug) {
            console.log(
              "\nDEVICE TYPE: " +
                "dingz" +
                "\nREQUEST TYPE: " +
                options.method +
                "\nDATA SENT: " +
                dataResolved[i][j] +
                "\nADDRESS: " +
                options.host +
                options.path +
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
      if (json["request"] == "output") {
        if (!json.hasOwnProperty("data")) {
          return false;
        } else {
          var hasZero = json.data.hasOwnProperty("outputZero");
          var hasOne = json.data.hasOwnProperty("outputOne");
          var hasTwo = json.data.hasOwnProperty("outputTwo");
          var hasThree = json.data.hasOwnProperty("outputThree");

          return hasZero && hasOne && hasTwo && hasThree && basics;
        }
      } else if (json["request"] == "set") {
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
      // console.log(buttonList);
      // console.log(req);

      for (var button of buttonList) {
        // console.log(button.actions[0][2]);
        // console.log(req.action);
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

          var actionReportOffset = parseInt(req.action) /*+ 1*/;
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
