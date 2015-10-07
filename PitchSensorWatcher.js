var PitchSensor = require('./PitchSensor');


function PitchSensorWatcher(port, updateInterval, idleInterval) {
    if (!(this instanceof PitchSensorWatcher)) return new PitchSensorWatcher(port, updateInterval);
    this.port = port;
    this.updateInterval = updateInterval || 100;
    this.idleInterval = idleInterval || 1000;

    this.active = false;
    this.note = null;

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

PitchSensorWatcher.prototype.getCurrentNote = function() {
    return this.note;
};

PitchSensorWatcher.prototype.checkSensor = function() {

    this.active = this.sensor.isActive();

    if (this.isActive()) {
        this.note = this.sensor.getCurrentNote();
    } else {
        this.note = null;
    }

    this.timer = setTimeout(this.checkSensor.bind(this), ( this.isActive() ? this.updateInterval : this.idleInterval ));
};

module.exports = PitchSensorWatcher;