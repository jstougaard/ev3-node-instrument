var ev3dev = require('ev3dev'),
    BangSensor = require('./BangSensor');


var id = "lead";

console.log("Running EV3 instrument", id);


var bang = new BangSensor(ev3dev.ports.INPUT_1);

bang.addListener("state_change", function(newState) {
    console.log( newState ? "Note on" : "Note off");
});