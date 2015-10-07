var events = require('events').EventEmitter,
    sensor = require('./bang-sensor');


var updateInterval = 20; // in ms

/*
 * Available events
 *  - state_change (newState)
 */

function BangEventWatcher(port) {
    if (!(this instanceof BangEventWatcher)) return new BangEventWatcher(port);
    this.port = port;
    this.state = false;

    this.playStartTime = 0; // TODO
    this.bpm = 120; // TODO
    this.beatLength = Math.round(60*1000 / this.bpm / 4 );

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

BangEventWatcher.prototype.isSensorConnected = function() {
    return sensor.isConnected();
}

BangEventWatcher.prototype.checkSensor = function() {

    if (!this.isSensorConnected()) {
        sensor.initSensor(this.port);
    }

    var currentState = this.isSensorConnected() ? sensor.getCurrentState() : this.getCurrentStateFromTime();

    if (this.state !== currentState) {
        this.emit("state_change", currentState);
        this.state = currentState;
    }
};

BangEventWatcher.prototype.getCurrentStateFromTime = function() {
    var now = Date.now();
    var beatProgress = (now - this.playStartTime) % this.beatLength;

    // TODO: Consider starting/stopping only if valid
    if (beatProgress <= this.beatLength / 2) {
        // Stop notes
        return false;

    } else if (beatProgress > this.beatLength / 2) {
        // Start new
        return true;
    }



    return this.state;
};


module.exports = BangEventWatcher;