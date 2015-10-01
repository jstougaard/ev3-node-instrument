var events = require('events').EventEmitter,
    sensorUtils = require('./sensor-utils'),
    handlers = require('./bang-sensor-handlers'),
    ev3dev = require('ev3dev');


var updateInterval = 10; // in ms

/*
 * Available events
 *  - state_change (newState)
 */

function BangSensor(port) {
    if (!(this instanceof BangSensor)) return new BangSensor(port);
    this.port = port;
    this.sensor = null;
    this.state = false;

    this.watchSensor();
}

// Extend EventEmitter
BangSensor.prototype = Object.create(events.prototype);

BangSensor.prototype.watchSensor = function() {

    if (this.intervalTimer) {
        this.stopWatchingSensor();
    }

    this.intervalTimer = setInterval(this.checkSensor.bind(this), updateInterval);

};

BangSensor.prototype.stopWatchingSensor = function() {
    clearInterval(this.intervalTimer);
    this.intervalTimer = null;
};

BangSensor.prototype.checkSensor = function() {

    if (!this.sensor || !this.sensor.connected) {
        this.initSensor();
    }

    var currentState = this.getCurrentSensorState();

    if (this.state !== currentState) {
        this.emit("state_change", currentState);
        this.state = currentState;
    }
};

BangSensor.prototype.initSensor = function() {
    this.sensor = new ev3dev.Sensor(this.port);
};

BangSensor.prototype.getCurrentSensorState = function() {
    try {

        if (sensorUtils.handlerExists(this.sensor.driverName, handlers)) {
            return sensorUtils.getHandler(this.sensor.driverName, handlers).getCurrentState(this.sensor);
        }

    } catch (e) {
        // No sensor
        this.sensor = null;
    }

    return this.getValueForNoSensor();
};

BangSensor.prototype.getValueForNoSensor = function() {
    return false;
};

module.exports = BangSensor;