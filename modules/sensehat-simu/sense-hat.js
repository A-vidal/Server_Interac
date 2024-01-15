const SIMULACION = false;

const senseHat = (SIMULACION)? require("./node-sense-hat-emu") : require("node-sense-hat");

exports.senseHat = senseHat;