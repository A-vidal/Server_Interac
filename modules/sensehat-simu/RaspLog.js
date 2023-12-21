// Abel Vidal Ripoll - Toni Tormo Pla

const senseHat = (process.env.USER == "pi") ?
                 require("node-sense-hat") : require("./node-sense-hat-emu");

// const senseHat = require("./node-sense-hat-emu")
const fs = require('fs');

// Función para obtener la fecha actual en formato dd/mm/aaaa
const formatFecha = (date = new Date()) => {
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const año = date.getFullYear();
  return `${dia}/${mes}/${año}`;
};

// Función para obtener la hora actual en formato hh:mm:ss
const formatHora = (date = new Date()) => {
  const hora = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  const segundos = date.getSeconds().toString().padStart(2, '0');
  return `${hora}:${minutos}:${segundos}`;
};

const IMU = new senseHat.Imu.IMU();
// Función para obtener la presión del sense-hat 
const readPressure = (data = IMU.getValueSync()) => {
  try {
    return data.pressure.toFixed(1)
  } catch (error) {
    console.error("readreadPressure():", error.message);
    process.exit(1);
  }
};

// Función para obtener la temperatura del sense-hat 
const readTemp = (data = IMU.getValueSync()) => {
  try {
    return data.temperature.toFixed(1)
  } catch (error) {
    console.error("readTemp():", error.message);
    process.exit(1);
  }
};

const readHumidity = (data = IMU.getValueSync()) => {
  try {
    return data.humidity.toFixed(1)
  } catch (error) {
    console.error("readHumidity():", error.message);
    process.exit(1);
  }
};

const stringifyData = (data, prec, final = "", labels = []) => {
  try {
    var object = "";
    if (labels.length == 0) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          object += " " + key + ": " + data[key].toFixed(prec) + " " + final + ",";
        }
      }
      return object.slice(0, object.length -1);
    }
    var i = 0;
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        object += " " + labels[i] + ": " + data[key].toFixed(prec) + " " + final + ",";
        ++i;
      }
    }
    return object.slice(0, object.length -1);
  } catch (error) {
    console.error("parseData():", error.message);
    process.exit(1);
  }
}

const readAll = (date = new Date(), data = IMU.getValueSync()) => {
  let fecha = formatFecha(date);
  let hora = formatHora(date);
  let temperatura = readTemp(data) + " ºC";
  let presion = readPressure(data) + " mbar";
  let humedad = readHumidity(data) + " %";
  let orientacion = stringifyData(data.fusionPose, 1, "º", ["y", "p", "r"]);
  let acelerometro = stringifyData(data.accel,3,"g");
  let giroscopio = stringifyData(data.gyro,3,"º/s");
  let mangnetometro = stringifyData(data.compass,3,"G");
  return [fecha, hora, temperatura, presion, humedad, orientacion, acelerometro, giroscopio, mangnetometro]
}
// Función para escribir en el archivo de log
const updateLog = (logfile, log) => {
  try {
    var linea = log.join(";") + "\n";
    fs.appendFileSync(logfile, linea);
    console.log(linea);
  } catch (error) {
    console.error('updateLog():', error.message);
    process.exit(1);
  }
};

// Función para crear el archivo de log
const createLog = (logfile, log) => {
  try {
    var linea = log.join(";") + "\n";
    fs.writeFileSync(logfile, linea);
    console.log(linea);
  } catch (error) {
    console.error('updateLog():', error.message);
    process.exit(1);
  }
};

const EventEmitter = require('events');

// Programa 
const logFile = "logfile.csv";
const cabeceras = ["Fecha", "Hora", "Temperatura", "Presion", "Humedad", "Orientacion", "Acelerometro", "Giroscopio", "Mangnetometro"];
// iniciamos el log
// createLog(logFile, cabeceras);
// creamos el emisor de eventos
const sensorEventEmitter = new EventEmitter();
// configuramos el evento
sensorEventEmitter.on('log', 
(date = new Date(), data = IMU.getValueSync()) => {
  let datos = readAll(date, data);
  updateLog(logFile, datos);
});
// activamos el evento cada 5sec
/*
setInterval(() => {
  sensorEventEmitter.emit('log');
}, 5000);
*/
exports.readAll = readAll;

exports.getData = {
  fecha: formatFecha,
  hora: formatHora,
  temp: readTemp,
  press: readPressure,
  hum: readHumidity,
  imu: IMU.getValueSync
}