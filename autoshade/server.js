const five = require('johnny-five');
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

const board = new five.Board();
board.on('ready', () => {
  const photocell = new five.Sensor({pin: 'A1', freq: 25});
  const servo = new five.Servo({pin: 11, start: 90, range: [0, 180]});
  let desiredLight = 50;
  let servoDegrees = 90;
  
  // Detect current ambient light to display in UI
  io.on('connection', (socket) => {
    let ambientLight
    console.log('a user connected');
    // Photocell measures every 25ms
    photocell.on('data', () => {
      const rawValue = photocell.value;
      const scaledValue = mapValue(rawValue, 0, 1024, 0, 100);
      ambientLight = scaledValue;
      
      // If too dim, open shade
      if (ambientLight < desiredLight && servoDegrees < 180) {
        console.log('too dim')
        servo.to(++servoDegrees);
      }
      // If too bright, close shade
      if (ambientLight > desiredLight && servoDegrees > 90) {
        console.log('too bright');
        servo.to(--servoDegrees);
      }

      const scaledShadeValue = mapValue(servoDegrees, 90, 180, 0, 100);
      
      io.emit('values', {photocellValue: scaledValue, shadeValue: scaledShadeValue});
    })  

    // Receive the desired light from UI
    socket.on('desiredLight', (value) => {
      desiredLight = value;
    })
  })
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

function mapValue(value, inMin, inMax, outMin, outMax) {
  return Math.round(((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin);
}