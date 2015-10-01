var events = require('events').EventEmitter,
    ev3dev = require('ev3dev');


var updateInterval = 5; // in ms

/*
 * Available events
 *  - state_change (newState)
 */

function BangSensor(port) {
    if (!(this instanceof BangSensor)) return new BangSensor(port);
    this.port = port;
    this.sensor = new ev3dev.Sensor(this.port);
    this.state = false;
};

// Extend EventEmitter
BangSensor.prototype = Object.create(events.prototype);



