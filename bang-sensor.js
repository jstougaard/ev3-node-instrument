var ev3dev = require('ev3dev'),
    sensorUtils = require('./sensor-utils');

/**
 * Define handlers for the different sensor types
 * Every handler must have the getCurrentState function
 * See sensor-utils for available handlerIDs
 */

var handlers = {

    button: {
        getCurrentState: function() {
            return !!sensor.getValue(valueIndex);
        }
    },

    IR: {
        threshold: 10,
        getCurrentState: function() {
            return sensor.getValue(valueIndex) < this.threshold;
        }
    },

    ultra_sonic: {
        threshold: 60,
        getCurrentState: function() {
            return sensor.getValue(valueIndex) < this.threshold;
        }
    },

    gyro: {
        mode: "GYRO-RATE",
        threshold: 300,
        avgSampleSize: 10,
        values: [],
        isActive: false,
        getCurrentState: function() {
            var value = Math.abs(sensor.getValue(valueIndex));
            var isAbove = value > this.threshold;

            if (isAbove) {
                this.isActive = true;
            }

            if (this.isActive) {
                this.addToSample(value);
                this.isActive = this.getAverage() > this.threshold;
            }

            if (!this.isActive) {
                this.resetSample();
            }

            return this.isActive;
        },

        addToSample: function(value) {
            for (var i=this.values.length; i <= this.avgSampleSize; i++) {
                this.values.push(value);
            }

            if (this.values.length > this.avgSampleSize) {
                this.values.shift();
            }
        },

        getAverage: function() {
            var total = 0;
            for(var i = 0; i < this.values.length; i++) {
                total += this.values[i];
            }
            return total / this.values.length
        },

        resetSample: function() {
            this.values = [];
        }
    },

    light: {
        threshold: 10,
        getCurrentState: function() {
            return sensor.getValue(valueIndex) > this.threshold;
        }
    }

};

var sensor = null;

var valueWhenNoSensorAvailable = false;
var fallbackHandler = {
    getCurrentState: function() {
        return valueWhenNoSensorAvailable;
    }
};

var valueIndex = 0; // Seems to be the same for all sensors

function getHandler() {
    if (sensor && sensor.connected) {
        return sensorUtils.getHandler(sensor.driverName, handlers) || fallbackHandler;
    }
    return fallbackHandler;
}

module.exports = {


    isConnected: function() {
        return sensor && sensor.connected;
    },

    initSensor: function(port) {
        sensor = new ev3dev.Sensor(port);

        var handler = getHandler();
        if (handler.mode) {
            try {
                sensor.mode = handler.mode;
            } catch (e) {
                console.log("Could not set mod - resetting sensor");
                sensor = null;
            }
        }
    },

    getCurrentState: function() {

        try {

            var handler = getHandler();
            return handler.getCurrentState();

        } catch (e) {
            // No sensor
            sensor = null;
        }

        return valueWhenNoSensorAvailable;

    }
};