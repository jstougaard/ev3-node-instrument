var PitchSensor = require('./PitchSensor');


function PitchSensorWatcher(port, updateInterval, idleInterval) {
    if (!(this instanceof PitchSensorWatcher)) return new PitchSensorWatcher(port, updateInterval);
    this.port = port;
    this.updateInterval = updateInterval || 100;
    this.idleInterval = idleInterval || 1000;

    this.connected = false;
    this.active = false;
    this.note = null;
    this.lastActiveNote = 0;

    this.sensor = new PitchSensor(port);

    this.watchSensor();
}

PitchSensorWatcher.prototype.watchSensor = function() {

    if (this.timer) {
        this.stopWatchingSensor();
    }

    this.timer = setTimeout(this.checkSensor.bind(this), this.updateInterval);

};

PitchSensorWatcher.prototype.stopWatchingSensor = function() {
    clearTimeout(this.timer);
    this.timer = null;
};

PitchSensorWatcher.prototype.isActive = function() {
    return this.active;
};

PitchSensorWatcher.prototype.isConnected = function() {
  return this.connected;
};

PitchSensorWatcher.prototype.getCurrentNote = function() {
    return this.note;
};

PitchSensorWatcher.prototype.getLastActiveNote = function() {
    return this.lastActiveNote;
}

PitchSensorWatcher.prototype.checkSensor = function() {

    this.active = this.sensor.isActive();

    if (this.isActive()) {
        this.note = this.sensor.getCurrentNote();
        this.lastActiveNote = this.note;
    } else {
        this.note = null;
    }

    this.connected = this.sensor.isConnected();

    this.timer = setTimeout(this.checkSensor.bind(this), ( this.isActive() ? this.updateInterval : this.idleInterval ));
};

module.exports = PitchSensorWatcher;