var events = require('events').EventEmitter,
    ev3dev = require('ev3dev'),
    sensorUtils = require('./sensor-utils');

var updateInterval = 500; // Read every second
var itemInterval = 45; // How big is the interval for each sound

function SoundSelector(port) {
    if (!(this instanceof SoundSelector)) return new SoundSelector(port);
    this.port = port;
    this.motor = null;
    this.initialPosition = null;
    this.currentSound = 1; // TODO: Get from server
    this.initialSound = this.currentSound;
    this.numberOfSounds = 10; // TODO: Consider grabbing this from server

    this.watchMotorPosition();
}

// Extend EventEmitter
SoundSelector.prototype = Object.create(events.prototype);

SoundSelector.prototype.watchMotorPosition = function() {
    if (this.intervalTimer) {
        this.stopWatchingMotorPosition();
    }

    this.intervalTimer = setInterval(this.checkPosition.bind(this), updateInterval);
};

SoundSelector.prototype.stopWatchingMotorPosition = function() {
    clearInterval(this.intervalTimer);
    this.intervalTimer = null;
};

SoundSelector.prototype.checkPosition = function() {
    if (!this.isMotorConnected()) {
        this._initMotor();
    }

    var currentPosition = this._readMotorPosition();

    if (!currentPosition) return; // No position

    var sound = this._getSoundFromPosition(currentPosition);

    if (this.currentSound !== sound) {
        this.emit("sound_change", sound);
        this.currentSound = sound;
    }
};

SoundSelector.prototype.isMotorConnected = function() {
    return this.motor && this.motor.connected;
};

SoundSelector.prototype._getSoundFromPosition = function(position) {
    var change = Math.floor((position - this.initialPosition) / itemInterval)
    return sensorUtils.negativeFriendlyModulo( ( this.initialSound + change ), this.numberOfSounds) + 1; // 1 based index
};

SoundSelector.prototype._readMotorPosition = function() {
    try {
        return this.motor.position;
    } catch (e) {
        this.motor = null;
    }
    return null;
};

SoundSelector.prototype._initMotor = function() {
    this.initialPosition = null;
    this.initialSound = this.currentSound;
    this.motor = new ev3dev.Motor(this.port);

};

module.exports = SoundSelector;