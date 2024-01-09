// Aqui van los comandos que se ejecutan en el servidor cuando un cliente se conecta
/*
const {Socket} = require("socket.io");
var s = new Socket() // s es para testear como va un socket, no hace nada
*/
const RaspLog = require("./sensehat-simu/RaspLog");
const fs = require("fs")

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

// RaspLog sistem
var log_sockets = new Array();
setInterval(() => {
  var log = RaspLog.readAll();
  IOlog("server", "log", log.join(";"));
  log_sockets.forEach((socket) => {
    socket.emit("log",log.join(";"));
  });
}, 3000);

// Broadcast sistem
var socketsList = new Array();

// Exports
exports.connect = (socket) => {
  socketsList.push(socket);
} // /socket.io/socket.io.js

exports.disconnect = (socket) => {
  socketsList.pop(socket);
}

exports.events = {
  "message": (socket, msj) => {
    socketsList.forEach(sock => {
      if (sock != socket) {
        sock.send(msj);
      }
    });
  },
  "rasplog": (socket, msj) => {
    log_sockets.push(socket);
  }
}