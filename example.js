var HID = require("node-hid"),
    N64Controller = require("./index.js")

// the N64Controller constructor takes the same arguments as HID.HID
// it also exposes the same EventEmitter interface, just with added
// events for each control. All events are demonstrated below.
HID.devices().forEach(function(device) {
  if (device.product === 'Generic   USB  Joystick  ') {
    controller = new N64Controller(device.path);
  }
});

function log(val) { return function(arg) { console.log("log: ", val, arg) } }

var buttons = ["A", "B", "Z", "START", "LSHOULDER", "RSHOULDER", "CUP", "CRIGHT", "CDOWN", "CLEFT"]
buttons.forEach(function(button) {
  controller.on("press"+button, log("pressed "+button));
  controller.on("release"+button, log("relased "+button));
});
controller.on("dpad", log("dpad"));
controller.on("analog", log("analog"));
controller.on("analogNS", log("analogNS"));
controller.on("analogEW", log("analogEW"));
