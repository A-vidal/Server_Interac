const unix = require('unix-dgram');
const process = require('process');
const events = require('events');

const KEY_UP = 103;
const KEY_LEFT = 105;
const KEY_RIGHT = 106;
const KEY_DOWN = 108;
const KEY_ENTER = 28;

const STATE_RELEASE = 0;
const STATE_PRESS = 1;
const STATE_HOLD = 2;

const server_filename = '/run/shm/rpi-sense-emu-stick'
const client_filename = '/run/shm/rpi-sense-emu-client-' + process.pid;

var client = unix.createSocket('unix_dgram');

client.on('error', function(err) {
    console.error(err);
});

var clientStarted = false;

function startClient() {
    if (clientStarted) {
        return;
    }

    client.setMaxListeners(300);

    client.bind(client_filename);
    client.connect(server_filename);
    client.send(Buffer.from('hello'));
    
    clientStarted = true;
}

const valueToString = (value) => {
    switch(value) {
        case STATE_RELEASE:
            return 'release';
        case STATE_PRESS:
            return 'press';
        case STATE_HOLD:
            return 'hold';
    }
};

const codeToString = (code) => {
    switch(code) {
        case KEY_UP:
            return 'up';
        case KEY_LEFT:
            return 'left';
        case KEY_RIGHT:
            return 'right';
        case KEY_DOWN:
            return 'down';
        case KEY_ENTER:
            return 'click';
    }
};

const emitJoystickEvent = (joystick, eventObj) => {
    joystick.emit(valueToString(eventObj.value), codeToString(eventObj.code));
};

module.exports.getJoystick = () => {
    startClient();

    return new Promise((resolve) => {
        const joystick = new events.EventEmitter();

        client.on('message', function (data, rinfo) {
            const timestamp = data.readUInt32LE(8);
            const timestampMs = data.readUInt32LE(12);
            const type = data.readUInt16LE(16);
            const code = data.readUInt16LE(18);
            const value = data.readUInt32LE(20);

            emitJoystickEvent(joystick, {
                timestamp,
                timestampMs,
                type,
                code,
                value
            });
        });

        resolve(joystick);
        return;
    })
}
