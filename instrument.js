#!/usr/bin/env node

var id = process.argv[2] || "lead1";

console.log("STARTING...", id.toUpperCase());

console.log("Loading dependencies...");
require('dotenv').load({path: '/home/instrument/.env'}); // Loading environment variables
var ev3dev = require('ev3dev'),
    BangEventWatcher = require('./BangEventWatcher'),
    PitchSensorWatcher = require('./PitchSensorWatcher'),
    PitchSensor = require('./PitchSensor'),
    SoundSelector = require('./SoundSelector');

console.log("Starting socket.io...");
var socket = require('socket.io-client')('http://'+process.env.WEBSOCKET_IP+':'+process.env.WEBSOCKET_PORT);
socket.on('connect', function() { console.log("Socket connected"); });
socket.on('disconnect', function() { console.log("Socket disconnected!"); });
socket.on('connect_error', function(err) { console.error("Socket connection error", err); });
socket.on('connect_timeout', function() { console.log("Socket connect timeout"); });


var bangWatcher = new BangEventWatcher(ev3dev.ports.INPUT_1);
var pitchSensor = new PitchSensor(ev3dev.ports.INPUT_2);
var secondaryPitch = new PitchSensorWatcher(ev3dev.ports.INPUT_3);

var soundSelector = new SoundSelector();
soundSelector.addListener("sound_change", function(newSound) {
    console.log("Change sound", newSound);
    socket.emit("change-sound", id, newSound);
});


var isPlaying = true,
    notesPlaying = [];

/**
 * On bang - play note
 */
bangWatcher.addListener("state_change", function(newState) {
    if (!isPlaying) return;

    if (newState) {
        playNotes();
    } else {
        doStopNotes();
    }
});

function playNotes() {
    var notesToPlay = [];

    // Main note
    if (bangWatcher.isSensorConnected() || pitchSensor.isActive()) {
        notesToPlay.push( pitchSensor.getCurrentNote() );
    }

    if (secondaryPitch.isActive()) {
        notesToPlay.push( secondaryPitch.getCurrentNote() );
    }

    if (notesToPlay.length > 0) {
        doPlayNotes(notesToPlay);
    }
}

function doPlayNotes(notes) {
    console.log("Note on", notes);
    socket.emit(id + "/start-notes", notes);
    notesPlaying = notesPlaying.concat(notes);
}

function doStopNotes() {
    if (notesPlaying.length > 0) {
        socket.emit(id + "/stop-notes", notesPlaying);
        notesPlaying = [];
    }
}

/**
 * Watch music state
 */
socket.on("start-beat", function() {
    bangWatcher.playStartTime = Date.now();
    console.log("Get the party started!");
    isPlaying = true;
});
socket.on("stop-beat", function() {
    isPlaying = false;
    console.log("Party over!");
});
socket.on(id + "/init-lead", function(currentSound, numberOfSounds) {
    console.log("Init lead", currentSound, numberOfSounds);
    soundSelector.currentSound = currentSound;
    soundSelector.numberOfSounds = numberOfSounds;
});

process.on('uncaughtException', function (err) {
    // TODO: The brick is dead! Alert us through the server!!
    console.log("Uncaught Exception", err);
    console.log(err.stack);
});