require('dotenv').config();
var five = require("johnny-five");
var Particle = require("particle-io");

var board = new five.Board({
  io: new Particle({
    token: process.env.TOKEN,
    deviceId: process.env.ID
  })
});
 
board.on("ready", function() {
  console.log("Device Ready..");
  var led = new five.Led("D1");

  this.repl.inject({
    led: led
  });

  led.blink(500);
});