const fs = require('fs');

const imu_filename = '/run/shm/rpi-sense-emu-imu';
const humidity_filename = '/run/shm/rpi-sense-emu-humidity';
const pressure_filename = '/run/shm/rpi-sense-emu-pressure';

const IMU_TYPE = 6;
const ACCEL_FACTOR = 4081.6327;
const GYRO_FACTOR = 57.142857;
const COMPASS_FACTOR = 7142.8571;
const ORIENT_FACTOR = 5214.1892;

const HUMIDITY_TYPE = 2;
const HUMIDITY_FACTOR = 256;
const TEMP_FACTOR = 64;

const PRESSURE_TYPE = 3;
const PRESSURE_FACTOR = 4096;

class IMU {
    constructor() {
        this.data = {
            timestamp: 0,

            accel: {x: 0, y: 0, z: 0},
            gyro: {x: 0, y: 0, z: 0},
            compass: {x: 0, y: 0, z: 0},
            fusionPose: {x: 0, y: 0, z: 0},

            temperature: 0,
            pressure: 0,
            humidity: 0,
            tiltHeading: 0
        };
    }

    getValueSync() {
        var buffer, fd, type;

        // IMU.
        try {
            buffer = Buffer.alloc(56);
            fd = fs.openSync(imu_filename, 'r');
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);

            type = buffer.readUInt8(0);
            if (type == IMU_TYPE) {
                this.data.timestamp = buffer.readBigUInt64LE(24);

                this.data.accel.x = buffer.readInt16LE(32 + (2 * 0)) / ACCEL_FACTOR;
                this.data.accel.y = buffer.readInt16LE(32 + (2 * 1)) / ACCEL_FACTOR;
                this.data.accel.z = buffer.readInt16LE(32 + (2 * 2)) / ACCEL_FACTOR;

                this.data.gyro.x = buffer.readInt16LE(38 + (2 * 0)) / GYRO_FACTOR;
                this.data.gyro.y = buffer.readInt16LE(38 + (2 * 1)) / GYRO_FACTOR;
                this.data.gyro.z = buffer.readInt16LE(38 + (2 * 2)) / GYRO_FACTOR;

                this.data.compass.x = buffer.readInt16LE(44 + (2 * 0)) / COMPASS_FACTOR;
                this.data.compass.y = buffer.readInt16LE(44 + (2 * 1)) / COMPASS_FACTOR;
                this.data.compass.z = buffer.readInt16LE(44 + (2 * 2)) / COMPASS_FACTOR;

                this.data.fusionPose.x = buffer.readInt16LE(50 + (2 * 0)) / ORIENT_FACTOR;
                this.data.fusionPose.y = buffer.readInt16LE(50 + (2 * 1)) / ORIENT_FACTOR;
                this.data.fusionPose.z = buffer.readInt16LE(50 + (2 * 2)) / ORIENT_FACTOR;
            }
        } catch (err) {
            console.error('ERROR: Cannot read ' + imu_filename);
        }

        // Humidity.
        try {
            buffer = Buffer.alloc(28);
            fd = fs.openSync(humidity_filename, 'r');
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);

            type = buffer.readUInt8(0);
            if (type == HUMIDITY_TYPE) {
                this.data.humidity = buffer.readInt16LE(22) / HUMIDITY_FACTOR;
                this.data.temperature = buffer.readInt16LE(24) / TEMP_FACTOR;
            }
        } catch (err) {
            console.error('ERROR: Cannot read ' + humidity_filename);
        }

        // Pressure.
        try {
            buffer = Buffer.alloc(28);
            fd = fs.openSync(pressure_filename, 'r');
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);

            type = buffer.readUInt8(0);
            if (type == PRESSURE_TYPE) {
                this.data.pressure = buffer.readInt32LE(16) / PRESSURE_FACTOR;
            }
        } catch (err) {
            console.error('ERROR: Cannot read ' + pressure_filename);
        }

        return this.data;
    }

    getValue(callback) {
        return callback(null, this.getValueSync());
    }
}

module.exports = {
    IMU
};
