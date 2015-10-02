var events = require('events').EventEmitter,
    sensor = require('./bang-sensor');


var updateInterval = 10; // in ms

/*
 * Available events
 *  - state_change (newState)
 */

function BangEventWatcher(port) {
    if (!(this instanceof BangEventWatcher)) return new BangEventWatcher(port);
    this.port = port;
    this.state = false;

    this.watchSensor();
}

// Extend EventEmitter
BangEventWatcher.prototype = Object.create(events.prototype);

BangEventWatcher.prototype.watchSensor = function() {

    if (this.intervalTimer) {
        this.stopWatchingSensor();
    }

    this.intervalTimer = setInterval(this.checkSensor.bind(this), updateInterval);

};

BangEventWatcher.prototype.stopWatchingSensor = function() {
    clearInterval(this.intervalTimer);
    this.intervalTimer = null;
};

BangEventWatcher.prototype.checkSensor = function() {

    if (!sensor.isConnected()) {
        sensor.initSensor(this.port);
    }

    var currentState = sensor.getCurrentState();

    if (this.state !== currentState) {
        this.emit("state_change", currentState);
        this.state = currentState;
    }
};


module.exports = BangEventWatcher;