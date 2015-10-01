/**
 * Define handlers for the different sensor types
 * Every handler must have the getCurrentState function
 * See sensor-utils for available handlerIDs
 */

valueIndex = 0; // Seems to be the same for all sensors

module.exports = {

    button: {
        getCurrentState: function(sensor) {
            return !!sensor.getValue(valueIndex);
        }
    },

    IR: {
        threshold: 10,
        getCurrentState: function(sensor) {
            return sensor.getValue(valueIndex) < this.threshold;
        }
    },

    ultra_sonic: {
        threshold: 10,
        getCurrentState: function(sensor) {
            return sensor.getValue(valueIndex) < this.threshold;
        }
    },

    gyro: {
        getCurrentState: function(sensor) {
            return false; // TODO !!
        }
    },

    light: {
        threshold: 10,
        getCurrentState: function(sensor) {
            return sensor.getValue(valueIndex) > this.threshold;
        }
    }

};