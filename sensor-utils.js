/**
 * Drivers
 * Button: lego-ev3-touch
 * IR: lego-ev3-ir
 * Ultra sonic: lego-ev3-us
 * Gyro: lego-ev3-gyro
 * Light: lego-ev3-color
 */

/**
 * EV3 drivername => handlerID
 */
var driverMapping = {
    "lego-ev3-touch": "button",
    "lego-ev3-ir": "IR",
    "lego-ev3-us": "ultra_sonic",
    "lego-ev3-gyro": "gyro",
    "lego-ev3-color": "light"
};

module.exports = {

    getHandlerID: function (driverName) {
        return driverMapping[driverName]
    },

    getHandler: function(driverName, availableHandlers) {
        return availableHandlers[ this.getHandlerID(driverName) ] || null;
    },

    handlerExists: function(driverName, availableHandlers) {
        return this.getHandlerID(driverName) && availableHandlers[ this.getHandlerID(driverName) ];
    },

    negativeFriendlyModulo: function(number, mod) {
        return ((number % mod) + mod) % mod;
    }
};