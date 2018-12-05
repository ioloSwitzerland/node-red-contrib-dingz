var typeList = ["dingz"];
var buttonTypes = 4;
var buttonText = ["First", "Second", "Third", "Forth"];
var buttonInteractions = ["single", "double", "long"];
var deviceList = []; //array of mac addresses which are already registerType
var nodeForMac = [];
var listenerState = false;
var macNameList;

module.exports = {
  getButtonInteractions: function() {
    return buttonInteractions;
  },
  getButtonTexts: function() {
    return buttonText;
  },
  getNumberOfInputs: function() {
    return buttonText.length;
  },
  insert: function(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  },

  getHostIp: function() {
    var os = require("os");
    var networkInterfaces = os.networkInterfaces();

    for (var key of Object.keys(networkInterfaces)) {
      for (var i = 0; i < networkInterfaces[key].length; i++) {
        var iface = networkInterfaces[key][i];
        if (iface.family == "IPv4" && iface.mac != "00:00:00:00:00:00") {
          return iface.address;
        }
      }
    }
  },

  setupWiredListFromJSON: function(taskJSON, node) {
    //get actions array for wiredList

    var actions = [];

    for (var i = 0; i < buttonText.length; i++) {
      var temp = [];

      for (var j = 0; j < buttonInteractions.length; j++) {
        temp.push(
          taskJSON.data[i.toString()][buttonInteractions[j]].url == "wire"
        );
      }

      actions.push(temp);
    }

    //Set button from wiredlist
    var buttonList = this.getWiredList();
    var i = 0;
    for (i; i < buttonList.length; i++) {
      if (buttonList[i].nodeID == node.id) {
        buttonList[i].actions = actions;
        buttonList[i].mac = taskJSON.mac;
        break;
      } else if (buttonList[i].mac == taskJSON.mac) {
        buttonList[i].actions = actions;
        buttonList[i].nodeID = node.id;
        break;
      }
    }

    //if does not already exist (i.e. loop iterated until end)
    if (i == buttonList.length || (i == 0 && buttonList.length == 0)) {
      buttonList.push({
        mac: taskJSON.mac,
        nodeID: node.id,
        actions: actions
      });
    }

    this.setWiredList(buttonList);
  },
  setupNodeMacPairs: function(node) {
    var buttonList = this.getWiredList();
    for (var i = 0; i < buttonList.length; i++) {
      if (buttonList[i].nodeID == node.id) {
        var nodeForMacTmp = nodeForMac;
        nodeForMacTmp[buttonList[i].mac] = node;
        nodeForMac = nodeForMacTmp;
      }
    }
  },
  setNodeForMac: function(list) {
    nodeForMac = list;
  },
  getNodeForMac: function() {
    return nodeForMac;
  },
  getWiredList: function() {
    fs = require("fs");
    var data;
    var path = __dirname + "/wiredlist.json";
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path, "utf8"));
    } else {
      data = [];
    }
    return data;
  },

  setWiredList: function(list) {
    fs = require("fs");
    var path = __dirname + "/wiredlist.json";

    try {
      fs.writeFileSync(path, JSON.stringify(list));
    } catch (err) {
      console.log("Error writing Metadata.json:" + err.message);
    }
  },

  setMacNameList: function(list) {
    macNameList = list;
    fs = require("fs");
    var path = __dirname + "/macnamelist.json";

    try {
      fs.writeFileSync(path, JSON.stringify(list));
    } catch (err) {
      console.log("Error writing Metadata.json:" + err.message);
    }
  },
  getListernerState: function() {
    return listenerState;
  },
  setListenerState: function(state) {
    listenerState = state;
  },
  getDeviceList: function() {
    if (deviceList == null || deviceList == []) {
      fs = require("fs");
      var deviceListNew;
      var path = __dirname + "/deviceList.json";
      if (fs.existsSync(path)) {
        deviceListNew = JSON.parse(fs.readFileSync(path, "utf8"));
      } else {
        deviceListNew = [];
      }
    }

    return deviceListNew;
  },

  setDeviceList: function(list) {
    deviceList = list;
    fs = require("fs");
    var path = __dirname + "/.json";

    try {
      fs.writeFileSync(path, JSON.stringify(list));
    } catch (err) {
      console.log("Error writing Metadata.json:" + err.message);
    }
  },

  //validity has to be checked beforehand
  getPathAndData: function(type, taskJSON, node) {
    var sendHackFlag = true;

    ip = taskJSON["ip"];
    mac = taskJSON["mac"];
    request = taskJSON["request"];
    data = taskJSON["data"];

    var resolvedPath = "";
    var resolvedData = "";

    if (type == "dingz") {
      if (request == "report") {
        //NO DATA SENT
        //TODO CHANGE URL
        resolvedPath += "/info";
      } else if (request == "set") {
        var settingURLs = [];

        for (var i = 0; i < buttonText.length; i++) {
          var settingButton = [];
          for (var action of buttonInteractions) {
            var currentURL = "";
            var errorFlag = false;

            if (
              data[i.toString()].hasOwnProperty(action) &&
              data[i.toString()][action]["url"].length > 0
            ) {
              if (data[i.toString()][action]["url"] != "wire") {
                var current = data[i.toString()][action];
                var url = current["url"];
                currentURL = "get://" + url;

                if (
                  current.hasOwnProperty("url-data") &&
                  current["url-data"].length > 0
                ) {
                  var urlData = current["url-data"];
                  //replace = with %3D
                  if (!sendHackFlag) {
                    urlData = urlData.replace(/=/g, "%3D");
                    urlData = urlData.replace(/&/g, "%26");
                  }

                  //replace & with %26

                  currentURL = "post://" + url + "?" + urlData;
                }
              } else {
                //CHANGE MIDDLE IP

                var offSet = data.hasOwnProperty("urlOffset")
                  ? data[i.toString()]["urlOffset"]
                  : ":1880";

                //TODO change this

                if (sendHackFlag) {
                  currentURL =
                    "post://" +
                    this.getHostIp() +
                    offSet +
                    "/dingzInput?mac=" +
                    mac.toUpperCase() +
                    "&action=" +
                    buttonInteractions.indexOf(action) +
                    "&button=" +
                    i.toString();
                } else {
                  currentURL =
                    "post://" +
                    this.getHostIp() +
                    offSet +
                    "/dingzInput?mac%3D" +
                    mac.toUpperCase() +
                    "%26action%3D" +
                    buttonInteractions.indexOf(action) +
                    "%26button%3D" +
                    i.toString();
                }
              }
              var url = action + "=" + currentURL;
              settingButton.push(url);
            }
          }

          settingURLs.push(settingButton);
        }
        resolvedData = settingURLs;

        //TODO change to not only 1 button
        resolvedPath += "/api/v1/action/";
      }
    }

    return [resolvedPath, resolvedData];
  },

  //TODO CORRECT ERROR HANDLING
  messageToJson: function(resp) {
    var ret;
    if (resp != "") {
      ret = {
        success: "true",
        response: resp
      };
    } else {
      ret = {
        success: "success",
        response: resp
      };
    }
    return ret;
  },

  numberToType: function(number) {
    switch (number) {
      case 108:
        return "dingz"; //v1
        break;
      default:
        return "unknown";
    }
  },

  amountDevicesForType: function() {
    //TODO change this line in mystrom
    var amount = new Array(typeList.length).fill(0); //amount of devices

    if (deviceList) {
      for (let i = 0; i < deviceList.length; i++) {
        var obj = deviceList[i];
        var index = typeList.indexOf(obj.type);
        if (index >= 0) {
          amount[index]++;
        }
      }
    }

    return zipToObject(typeList, amount);
  },
  getDevice: function(mac) {
    for (var device of deviceList) {
      if (device.mac == mac) {
        return device;
      }
    }
    return null;
  }
};

function zipToObject(a, b) {
  if (a.length != b.length) {
    console.log("NOT SAME LENGTH");
    return;
  }

  var object = {};
  for (var i = 0; i < a.length; i++) {
    object[a[i]] = b[i];
  }

  return object;
}

function formatMac(mac) {
  mac = mac.replace(/:/g, "");
  return mac.toUpperCase();
}
