var typeList = ["switch", "bulb", "buttonplus", "button", "strip", "dingz"];
var buttonTypes = 4;
var dimmerText = ["Zero", "One", "Two", "Three"];
var buttonText = ["First", "Second", "Third", "Forth"];
var buttonInteractions = ["single", "double", "long"];
var deviceList = []; //array of mac addresses which are already registerType
var nodeForMac = [];
var listenerState = false;
var macNameList;
var http = require("http");

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
    var deviceListNew = deviceList;
    /*if (deviceListNew == null || deviceListNew == []) {
      fs = require("fs");

      var path = __dirname + "/deviceList.json";
      if (fs.existsSync(path)) {
        deviceListNew = JSON.parse(fs.readFileSync(path, "utf8"));
      } else {
        deviceListNew = [];
      }
    }*/

    return deviceListNew;
  },

  setDeviceList: function(list) {
    deviceList = list;
    /*  fs = require("fs");
    var path = __dirname + "/.json";

    try {
      fs.writeFileSync(path, JSON.stringify(list));
    } catch (err) {
      console.log("Error writing Metadata.json:" + err.message);
    }*/
  },

  //validity has to be checked beforehand
  getPathAndData: async function(
    type,
    taskJSON,
    node,
    callback,
    finallyCallback
  ) {
    var sendHackFlag = true;

    ip = taskJSON["ip"];
    mac = taskJSON["mac"];
    request = taskJSON["request"];
    data = taskJSON["data"];

    var resolvedPath;
    var resolvedData;

    if (type == "dingz") {
      if (request == "report") {
        //NO DATA SENT
        resolvedData = "";
        //TODO CHANGE URL
        resolvedPath = ["/info"];
      } else if (request == "set") {
        http
          .get("http://" + ip + "/api/v1/action", res => {
            const contentType = res.headers["application/json"];

            res.setEncoding("utf8");
            let rawData = "";

            res.on("data", chunk => {
              rawData += chunk;
            });
            res.on("end", () => {
              try {
                const parsedData = JSON.parse(rawData);
                //ISNERT HERE
                var settingURLs = [];
                var settingPaths = [];

                for (var i = 0; i < buttonText.length; i++) {
                  var settingButtonURL = [];
                  var settingButtonPaths = [];

                  for (var action of buttonInteractions) {
                    var dingzActor = "btn" + i.toString();
                    var resolvedPath = "/" + dingzActor + "/" + action;
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
                          currentURL = "post://" + url + "?" + urlData;
                        }
                      } else {
                        var offSet = data.hasOwnProperty("urlOffset")
                          ? data["urlOffset"]
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

                      if (parsedData[dingzActor][action] != currentURL) {
                        var url = currentURL;
                        var path = "/api/v1/action" + resolvedPath;

                        settingButtonPaths.push(path);
                        settingButtonURL.push(url);
                      }
                    }
                  }

                  settingURLs.push(settingButtonURL);
                  settingPaths.push(settingButtonPaths);
                }

                resolvedData = settingURLs;
                resolvedPath = settingPaths;
                callback(
                  [resolvedPath, resolvedData],
                  taskJSON,
                  finallyCallback
                );
              } catch (e) {
                console.error(e.message);
              }
            });
          })
          .on("error", e => {
            console.error(`Got error: ${e.message}`);
            callback("error", taskJSON, finallyCallback);
          });
      } else if (request == "output") {
        //4 = amount of dimmer inputs
        var settingData = [];
        var settingPath = [];
        for (var i = 0; i < dimmerText.length; i++) {
          var dummyData = "dummy";
          var outValue = data["output" + dimmerText[i]];
          var path = "/api/v1/dimmer/" + i.toString() + "/on?value=" + outValue;
          settingData.push(dummyData);
          settingPath.push(path);
        }
        resolvedData = [settingData];
        resolvedPath = [settingPath];
      }

      callback([resolvedPath, resolvedData], taskJSON, finallyCallback);
    }
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
      case 101:
        return "switch"; //v1
        break;
      case 102:
        return "bulb";
        break;
      case 103:
        return "buttonplus";
        break;
      case 104:
        return "button";
        break;
      case 105:
        return "strip";
        break;
      case 106:
        return "switch"; //v2
        break;
      case 107:
        return "switch"; //EU
        break;
      case 108:
        return "dingz"; //v1
        break;
      default:
        return "unkown";
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
  },

  getDateString: function() {
    var date = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    var month = monthNames[date.getMonth()];
    var day = date.getDate();
    var h = date.getHours();
    var min = date.getMinutes();
    var s = date.getSeconds();

    return " at " + h + ":" + min + ":" + s + " " + day + "th of " + month;
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
