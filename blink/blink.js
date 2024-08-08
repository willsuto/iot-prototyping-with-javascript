require('dotenv').config();
const five = require("johnny-five");
const Particle = require("particle-io");

const board = new five.Board({
  io: new Particle({
    token: process.env.TOKEN,
    deviceId: process.env.ID
  })
});
 
board.on("ready", function() {
  console.log("Device Ready..");
  const led = new five.Led("D1");
  
  led.blink(500);

  this.repl.inject({
    led: led
  });
});