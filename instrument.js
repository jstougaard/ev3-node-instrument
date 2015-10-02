var ev3dev = require('ev3dev'),
    BangEventWatcher = require('./BangEventWatcher');


var id = "lead";

console.log("Running EV3 instrument", id, ev3dev.ports.INPUT_1);


var bangWatcher = new BangEventWatcher(ev3dev.ports.INPUT_1);

bangWatcher.addListener("state_change", function(newState) {
    console.log( newState ? "Note on" : "Note off");
});