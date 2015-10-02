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
        threshold: 40,
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

var valueIndex = 0; // Seems to be the same for all sensors

function getHandler(driverName) {
    return sensorUtils.getHandler(driverName, handlers);
}

module.exports = {


    isConnected: function() {
        return sensor && sensor.connected;
    },

    initSensor: function(port) {
        sensor = new ev3dev.Sensor(port);

        if (sensor.connected && getHandler(sensor.driverName).mode) {
            sensor.mode = getHandler(sensor.driverName).mode;
        }
    },

    getCurrentState: function() {

        try {

            var handler = getHandler(sensor.driverName);
            if (handler) {
                return handler.getCurrentState();
            }

        } catch (e) {
            // No sensor
            sensor = null;
        }

        return valueWhenNoSensorAvailable;

    }
};