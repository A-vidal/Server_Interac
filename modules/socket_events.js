// Aqui van los comandos que se ejecutan en el servidor cuando un cliente se conecta
/*
const {Socket} = require("socket.io");
var s = new Socket() // s es para testear como va un socket, no hace nada
*/
const RaspLog = require("./RaspLog");
const leds = require("./leds");
const fs = require("fs");

// Log
const IOlog = (id, event, data) => {
  try {
      fs.appendFileSync("./logs/IO_server.csv", [
          id, 
          event,
          String(data)
      ].join(";") + "\n");
  } catch (error) {
      console.error("IOlog():", error.message);
      process.exit(1);
  }
}

// RaspLog sistem #########################################################
var log_sockets = new Array();
setInterval(() => {
  var log = RaspLog.readAll();
  if (log_sockets.length != 0) {
    IOlog("server", "log", log.join(";"));
  }
  log_sockets.forEach((socket) => {
    socket.emit("log",log.join(";"));
  });
}, 3000);

// Broadcast sistem #######################################################
var socketsList = new Array();
const goBroadcast = (socket, msj) => {
  socketsList.forEach(sock => {
    if (sock != socket) {
      sock.send(msj);
    }
  });
}

// Leds sistem ############################################################
const set_led = (msj) => {
  arr = String(msj).split("#");
  pos = arr[0].split(",")
  color = leds.hexToRgb("#" + arr[1]);
  leds.setLed(pos, color);
}

// Exports ################################################################
exports.connect = (socket) => {
  socketsList.push(socket);
} // /socket.io/socket.io.js

exports.disconnect = (socket) => {
  socketsList.pop(socket);
}

exports.events = {
  "message": (socket, msj) => {
    goBroadcast(socket, msj);
  },
  "rasplog": (socket, msj) => {
    log_sockets.push(socket);
  },
  "led": (socket, msj) => {
    set_led(msj);
  }
}