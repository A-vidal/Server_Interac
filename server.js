// Abel Vidal Ripoll - Toni Tormo Pla

// Node imports
const http = require("http");
const fs = require('fs');
const ip = require('ip');

// Local modules
const dir = require("./modules/dir");
const rasp = require("./modules/rasp");
const http_server = require("./modules/http_server");
try {
  const RaspLog = require("./modules/sensehat-simu/RaspLog");
} catch (error) {
  console.log("Recuerda activar el simulador");
  console.error("RaspLog[]:", error.message);
  process.exit(1);
}

// Responses
const http_control = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/control.html"));
    res.end();
  } catch (error) {
    console.error("http_control():", error.message);
    process.exit(1);
  }
}

const http_hud = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/hud.html"));
    res.end();
  } catch (error) {
    console.error("http_hud():", error.message);
    process.exit(1);
  }
}

const http_ajustes = (res) => {
  try {
    var data = fs.readFileSync("./http/ajustes.json")
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(data);
    res.end();
  } catch (error) {
    console.error("http_ajustes():", error.message);
    process.exit(1);
  }
}

// %%%%%%%%%%%%%%%% COMMANDS %%%%%%%%%%%%%%%%%%%

const commands = {
  "": (req, res) => {
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.write("¡Hola Mundo!");
      res.end();
  },
  "hola": (req, res) => {
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.write("¡Hola Mundo!");
      res.end();
  },
  "control": (req, res) => {
    http_control(res);
  },
  "hud": (req, res) => {
    http_hud(res);
  },
  "ajustes": (req, res) => {
    http_ajustes(res);
  },
  "listdir": (req, res) => {
    dir.http_listdir(res);
  },
  "temperatura": (req, res) => {
    rasp.respondTemp(res);
  },
  "memoria": (req, res) => {
    rasp.respondMem(res);
  },
  "fecha": (req, res) => {
    rasp.respondFecha(res);
  },
  "hora": (req, res) => {
    rasp.respondHora(res);
  },
}

//
// Servidor HTTP.
//

const SERVER_PORT = 7000;

const server = http_server.createServer(SERVER_PORT, commands, true);