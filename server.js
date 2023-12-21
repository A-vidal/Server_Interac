// Abel Vidal Ripoll - Toni Tormo Pla

// Node imports
const http = require("http");
const fs = require('fs');
const ip = require('ip');

// Local modules
const dir = require("./modules/dir");
const rasp = require("./modules/rasp");
// const RaspLog = require("./modules/sensehat-simu/RaspLog")

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

//
// Raspberry
//
/*
const respondRaspLog = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(String(fs.readFileSync("./http/RaspLog.html")));
    res.end();
  } catch (error) {
    console.error("RaspLog():", error.message);
    process.exit(1);
  }
}

const updateRaspLog = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(RaspLog.readAll().join(";"));
    res.end();
  } catch (error) {
    console.error("uRaspLog():", error.message);
    process.exit(1);
  }
}
*/

//
// Servidor HTTP.
//

const get_handeler = (req, res) => {
  switch (req.url) {
    case "/":
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.write("¡Hola Mundo!");
      res.end();
      break;
    case "/control":
      http_control(res);
      break;
    case "/hud":
      http_hud(res);
      break;
    case "/ajustes":
      http_ajustes(res);
      break;
    case "/dir":
      dir.http_listdir(res);
      break;
    case "/temperatura":
      rasp.respondTemp(res);
      break;
    case "/memoria":
      rasp.respondMem(res);
      break;
    case "/fecha":
      rasp.respondFecha(res);
      break;
    case "/hora":
      rasp.respondHora(res);
    default:
      if (req.url.search("\\.") == -1) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("Error 404: comand not existent");
        res.end();
      } else {
        dir.http_file(res, req.url);
      }
      break;
  }
  console.log("end GET\n")
}

var server = http.createServer((req, res) => {
  console.log(req.method + ": " + req.url);
  if (req.method === "GET") {
    get_handeler(req, res);
  } else {
    res.writeHead(501, {"Content-Type": "text/plain"});
    res.write("Error 501: method not implemented");
    res.end();
  }
});

const SERVER_PORT = 7000;

server.listen(SERVER_PORT, function () {
  console.log("Servidor disponible la siguiente dirección:");
  console.log(`http://${ip.address()}:${SERVER_PORT}/`);
  console.log("Si no funciona, esta trabajando en local:");
  console.log(`http://127.0.0.1:${SERVER_PORT}/`);
  console.log("Servidor en marcha...\n");
});