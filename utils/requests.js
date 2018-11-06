var helpers = require('../utils/helpers')
module.exports = {
  typeQuery: function(callback, device) {
    var http = require('http');
    var body = '';
    var options = {
      host: device.ip,
      path: "/device",
    };

    var req = http.request(options, (response) => {
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
        json = JSON.parse(body)
        key = Object.keys(json)[0]
        if (json[key].has_pir) {
          device.type += "oneplus"
          device.name = "Dingz one+"
        } else {
          device.type += "one"
          device.name = "Dingz one"
        }
        callback(device);
      });
    });

    req.on('error', function(err) {
      var json = helpers.messageToJson(body)
      callback(json);
    });

    req.end();
  }

}