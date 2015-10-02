var ev3dev = require('ev3dev'),
    sensorUtils = require('./sensor-utils');

var sensor = null;
var valueIndex = 0;
var minNote = 1;
var maxNote = 9;

/**
 * Define handlers for the different sensor types
 * Every handler must have the getCurrentNote function
 * See sensor-utils for available handlerIDs
 */
var handlers = {

    button: {
        getCurrentNote: function() {
            return sensor.getValue(valueIndex) + 1;
        }
    },

    IR: {
        maxDistance: 50,
        toneInterval: 50 / maxNote,
        getCurrentNote: function() {
            var value = sensor.getValue(valueIndex);
            return Math.min(Math.ceil( value / this.toneInterval ), maxNote);
        }
    },

    ultra_sonic: {
        maxDistance: 800,
        toneInterval: 800 / maxNote,
        getCurrentNote: function() {
            var value = sensor.getValue(valueIndex);
            return Math.min(Math.ceil( value / this.toneInterval ), maxNote);
        }
    },

    gyro: {
        rotationMax: 180,
        toneInterval: 180 / maxNote,
        getCurrentNote: function() {
            var value = sensor.getValue(valueIndex);
            return Math.ceil( this.negativeFriendlyModulo(value, this.rotationMax) / this.toneInterval);
        },
        negativeFriendlyModulo: function(number, mod) {
            return ((number % mod) + mod) % mod;
        }
    },

    light: {
        mode: "COL-COLOR",
        getCurrentNote: function() {
            return sensor.getValue(valueIndex);
        }
    }

};

var valueWhenNoSensorAvailable = minNote;
var fallbackHandler = {
    getCurrentNote: function() {
        return valueWhenNoSensorAvailable;
    }
};


function PitchSensor(port) {
    if (!(this instanceof PitchSensor)) return new PitchSensor(port);
    this.port = port;
}

PitchSensor.prototype.getCurrentNote = function() {
    try {
        return this._readSensor();
    } catch (e) {
        sensor = null;
        return this._readSensor();

    }
};

PitchSensor.prototype._readSensor = function() {
    if (!sensor || !sensor.connected) {
        this._initSensor();
    }

    return this._getHandler().getCurrentNote();
};

PitchSensor.prototype._initSensor = function() {
    sensor = new ev3dev.Sensor(this.port);
    this._initSensorMode();
};

PitchSensor.prototype._initSensorMode = function() {
    var handler = this._getHandler();
    if (handler.mode) {
        sensor.mode = handler.mode;
    }
};

PitchSensor.prototype._getHandler = function() {
    if (sensor && sensor.connected) {
        return sensorUtils.getHandler(sensor.driverName, handlers) || fallbackHandler;
    }
    return fallbackHandler;
};

module.exports = PitchSensor;