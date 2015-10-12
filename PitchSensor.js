var ev3dev = require('ev3dev'),
    sensorUtils = require('./sensor-utils');

var valueIndex = 0;
var minNote = 1;
var maxNote = 9;

/**
 * Define handlers for the different sensor types
 * Every handler must have the getCurrentNote and isActive functions
 * See sensor-utils for available handlerIDs
 */
var handlers = {

    button: {
        getCurrentNote: function(sensor) {
            return sensor.getValue(valueIndex) + 1;
        },
        isActive: function(sensor) {
            return sensor.getValue(valueIndex) === 1;
        }
    },

    IR: {
        maxDistance: 30,
        toneInterval: 30 / maxNote,
        getCurrentNote: function(sensor) {
            var value = sensor.getValue(valueIndex);
            return Math.min(Math.ceil( (value+1) / this.toneInterval ), maxNote);
        },
        isActive: function(sensor) {
            return sensor.getValue(valueIndex) < this.maxDistance;
        }
    },

    ultra_sonic: {
        maxDistance: 400,
        toneInterval: 400 / maxNote,
        getCurrentNote: function(sensor) {
            var value = sensor.getValue(valueIndex);
            return Math.min(Math.ceil( (value+1) / this.toneInterval ), maxNote);
        },
        isActive: function(sensor) {
            return sensor.getValue(valueIndex) < this.maxDistance;
        }
    },

    gyro: {
        rotationMax: 360,
        toneInterval: 360 / maxNote,
        getCurrentNote: function(sensor) {
            var value = sensor.getValue(valueIndex);
            return Math.max(Math.ceil( sensorUtils.negativeFriendlyModulo(value, this.rotationMax) / this.toneInterval), 1);
        },
        isActive: function(sensor) {
            return true;
        }
    },

    light: {
        mode: "COL-COLOR",
        getCurrentNote: function(sensor) {
            return sensor.getValue(valueIndex) + 1;
        },
        isActive: function(sensor) {
            return sensor.getValue(valueIndex) !== 0;
        }
    }

};

var valueWhenNoSensorAvailable = minNote;
var fallbackHandler = {
    getCurrentNote: function() {
        return valueWhenNoSensorAvailable;
    },
    isActive: function() {
        return false;
    }
};


function PitchSensor(port) {
    if (!(this instanceof PitchSensor)) return new PitchSensor(port);
    this.port = port;
    this.sensor = null;
}

PitchSensor.prototype.getCurrentNote = function() {
    try {
        return this._readSensor();
    } catch (e) {
        this.sensor = null;
        return this._readSensor();

    }
};

PitchSensor.prototype.isActive = function() {
    try {
        return this._isSensorActive();
    } catch (e) {
        this.sensor = null;
        return this._isSensorActive();

    }
};

PitchSensor.prototype.isConnected = function() {
    return this.sensor && this.sensor.connected;
}

PitchSensor.prototype._readSensor = function() {
    if (!this.sensor || !this.sensor.connected) {
        this._initSensor();
    }

    return this._getHandler().getCurrentNote(this.sensor);
};

PitchSensor.prototype._isSensorActive = function() {
    if (!this.isConnected()) {
        this._initSensor();
    }

    return this._getHandler().isActive(this.sensor);
};

PitchSensor.prototype._initSensor = function() {
    this.sensor = new ev3dev.Sensor(this.port);
    this._initSensorMode();
};

PitchSensor.prototype._initSensorMode = function() {
    var handler = this._getHandler();
    if (handler.mode) {
        this.sensor.mode = handler.mode;
    }
};

PitchSensor.prototype._getHandler = function() {
    if (this.isConnected()) {
        return sensorUtils.getHandler(this.sensor.driverName, handlers) || fallbackHandler;
    }
    return fallbackHandler;
};

module.exports = PitchSensor;