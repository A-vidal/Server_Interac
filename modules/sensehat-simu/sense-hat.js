const SIMULACION = true;

const senseHat = (SIMULACION)? require("./node-sense-hat-emu") : require("node-sense-hat");

exports.senseHat = senseHat;