var HID = require('node-hid');

function N64Controller(path) {
  HID.HID.call(this, path);
  this.controlState = new Buffer(8);
  this.buttonAddresses = {
    "A":        [6, 0x04],
    "B":        [6, 0x10],
    "Z":        [6, 0x08],
    "START":    [6, 0x20],
    "LSHOULDER":[6, 0x01],
    "RSHOULDER":[6, 0x02],
    "CUP":      [5, 0x10],
    "CRIGHT":   [5, 0x20],
    "CDOWN":    [5, 0x40],
    "CLEFT":    [5, 0x80]
  };
  this.dPadDirections = {
    0:  "N",
    1:  "NE",
    2:  "E",
    3:  "SE",
    4:  "S",
    5:  "SW",
    6:  "W",
    7:  "NW",
    15: null
  };

  this.on("data", function(data) {

    var dPad = data[5] & 0x0F
    if ((this.controlState[5] & 0x0F) != dPad) {
      this.emit("dpad", this.dPadDirections[dPad]);
    }

    var analogEW = data[0];
    var analogNS = data[1];
    if (this.controlState[0] != analogEW) {
      this.emit("analogEW", analogEW);
      this.emit("analog", [analogNS, analogEW]);
    }
    if (this.controlState[1] != analogNS) {
      this.emit("analogNS", analogNS);
      this.emit("analog", [analogNS, analogEW]);
    }

    // console.log(data);
    for (key in this.buttonAddresses) {
      var address = this.buttonAddresses[key];
      var chunk = address[0];
      var mask = address[1];
      if (
        // check if different from controlState
        (this.controlState[chunk] & mask) !=
        (data[chunk] & mask)
      ) {
        if ((data[chunk] & mask) === mask) {
          this.emit("press"+key);
        } else {
          this.emit("release"+key);
        }
      }
    };

    // save state to compare against next frame
    data.copy(this.controlState);
  });
}

N64Controller.prototype = Object.create(HID.HID.prototype);
N64Controller.prototype.constructor = N64Controller;

module.exports = N64Controller;
