var typeList = ["dingzone", "dingzoneplus"]
var http = require('http');
var buttonInteractions = ["single", "double", "long"]
var deviceList = [] //array of mac addresses which are already registerType
var nodeForMac = []
var listenerState = false

module.exports = {
  insert: function(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  },

  getHostIp: function() {
    var os = require('os');
    var networkInterfaces = os.networkInterfaces();

    for (var key of Object.keys(networkInterfaces)) {
      for (var i = 0; i < networkInterfaces[key].length; i++) {
        var iface = networkInterfaces[key][i]
        if (iface.family == 'IPv4' && iface.mac != '00:00:00:00:00:00') {
          return iface.address
        }
      }
    }
  },

  setupWiredListFromJSON: function(taskJSON, node) {
    //get actions array for wiredList
    var actions = [taskJSON.data.single['url'], taskJSON.data.double['url'], taskJSON.data.long['url'], taskJSON.data.touch['url']]
    actions = actions.map((value, index, array) => {
      return value == "wire"
    })

    //Set button from wiredlist
    var buttonList = this.getWiredList()
    var i = 0
    for (i; i < buttonList.length; i++) {
      if (buttonList[i].nodeID == node.id) {
        buttonList[i].actions = actions
        buttonList[i].mac = taskJSON.mac
        break
      } else if (buttonList[i].mac == taskJSON.mac) {
        buttonList[i].actions = actions
        buttonList[i].nodeID = node.id
        break
      }
    }

    //if does not already exist (i.e. loop iterated until end)
    if (i == buttonList.length || (i == 0 && buttonList.length == 0)) {
      buttonList.push({ 'mac': taskJSON.mac, 'nodeID': node.id, 'actions': actions })
    }

    this.setWiredList(buttonList)

  },
  setupNodeMacPairs: function(node) {
    var buttonList = this.getWiredList()
    for (var i = 0; i < buttonList.length; i++) {
      if (buttonList[i].nodeID == node.id) {
        var nodeForMacTmp = nodeForMac
        nodeForMacTmp[buttonList[i].mac] = node
        nodeForMac = nodeForMacTmp
      }
    }
  },
  setNodeForMac: function(list) {
    nodeForMac = list
  },
  getNodeForMac: function() {
    return nodeForMac
  },
  getWiredList: function() {
    fs = require('fs');
    var data
    var path = __dirname + '/wiredlist.json'
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path, 'utf8'))
    } else {
      data = []
    }
    return data
  },

  setWiredList: function(list) {
    fs = require('fs');
    var path = __dirname + '/wiredlist.json'
    fs.writeFileSync(path, JSON.stringify(list), function(err) {
      if (err) return console.log(err);
    });
  },
  getListernerState: function() {
    return listenerState;
  },
  setListenerState: function(state) {
    listenerState = state
  },
  getDeviceList: function() {
    return deviceList
  },

  setDeviceList: function(list) {
    deviceList = list
  },

  //validity has to be checked beforehand
  getPathAndData: function(type, taskJSON, node) {
    ip = taskJSON["ip"]
    mac = taskJSON["mac"]
    request = taskJSON["request"]
    data = taskJSON["data"]

    var resolvedPath = ""
    var resolvedData = ""

    //TODO
    return [resolvedPath, resolvedData]
  },

  messageToJson: function(resp) {
    var ret;
    if (resp != '') {
      ret = { success: "true", response: resp };
    } else {
      ret = { success: "false", response: "" };
    }
    return ret
  },

  numberToType: function(number, ip) {

    switch (number) {
      case 108:
        return "dingz"
        break;
      default:
        return "unkown"
    }
  },


  amountDevicesForType: function() {
    var amount = new Array(typeList.length).fill(0) //amount of devices

    if (deviceList) {
      for (let i = 0; i < deviceList.length; i++) {
        var obj = deviceList[i]
        var index = typeList.indexOf(obj.type)
        if (index >= 0) {
          amount[index]++
        }
      }
    }

    return zipToObject(typeList, amount)

  },

  knownDevicesWithIP: function() {
    var macList = []
    var ipList = []
    for (var i of deviceList) {
      macList.push(i.mac)
      ipList.push(i.ip)
    }
    return zipToObject(macList, ipList)
  }
};


function zipToObject(a, b) {
  if (a.length != b.length) {
    console.log("NOT SAME LENGTH");
    return

  }

  var object = {}
  for (var i = 0; i < a.length; i++) {
    object[a[i]] = b[i]
  }

  return object
}

function formatMac(mac) {
  mac = mac.replace(/:/g, '');
  return mac.toUpperCase();
}