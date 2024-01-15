//
// Sense HAT simulator test.
//
const senseHat = (process.env.USER == "pi") ?
                 require("node-sense-hat") : require("./node-sense-hat-emu");

const IMU = new senseHat.Imu.IMU();

const TIMEOUT = 1000; // ms

function task()
{
    // IMU.
    var data = IMU.getValueSync();
    console.log("Temperature %s ºC, pressure %s mbar, humidity %s %%",
                data.temperature.toFixed(1),
                data.pressure.toFixed(1),
                data.humidity.toFixed(1));
}

// LEDs.
senseHat.Leds.clear();
senseHat.Leds.showMessage("Hello world!", 0.2);

// Joystick.
senseHat.Joystick.getJoystick().then(joystick => {
    joystick.on("press", direction => {
        console.log("Joystick pressed in " + direction + " direction");
    });
    joystick.on("release", direction => {
        console.log("Joystick released in " + direction + " direction");
    });
    joystick.on("hold", direction => {
        console.log("The joystick is being held in the " + direction + " direction");
    });
});

// IMU interval task.
setInterval(task, TIMEOUT);
