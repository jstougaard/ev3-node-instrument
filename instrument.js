var ev3dev = require('ev3dev'),
    BangEventWatcher = require('./BangEventWatcher'),
    PitchSensor = require('./PitchSensor');


var id = "lead";

console.log("Running EV3 instrument", id, ev3dev.ports.INPUT_1);


var bangWatcher = new BangEventWatcher(ev3dev.ports.INPUT_1);
var pitchSensor = new PitchSensor(ev3dev.ports.INPUT_2);

bangWatcher.addListener("state_change", function(newState) {
    console.log( newState ? "Note on" : "Note off", pitchSensor.getCurrentNote());
});