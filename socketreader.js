/*
 * socketreader
 *
 * this script just scans GPIO pins and pings the movement URLs
 */

var Gpio = require('onoff').Gpio,
  pinA = new Gpio(17, 'in', 'both', {debounceTimeout: 0}),
  pinB = new Gpio(27, 'in', 'both', {debounceTimeout: 0});

var request = require('request');

function exit() {
  pinA.unexport();
  pinB.unexport();
  console.log('pins unexported');
  process.exit();
}

var rotaryA = 0;
var rotaryB = 0;
var newState = 0;
var lastState = 0;
var prevDelta = 0;

pinA.watch(function (err, value) {
  if (err) {
    throw err;
  }

  if(value != rotaryA) {
    rotaryA = value;
    updateClient();
  }

});

pinB.watch(function (err, value) {
  if (err) {
    throw err;
  }

  if(value != rotaryB) {
    rotaryB = value;
    updateClient();
  }
});

function updateClient() {
  var xorVal = rotaryA ^ rotaryB;

  // Get the new rotary encoder state
  var newState = (rotaryA * 4) + (rotaryB * 2) + (xorVal * 1);
  // Get the delta (difference) between the previous state and the new state
  var delta = (newState - lastState) % 4;
  // Store the state for next time around
  lastState = newState;

  //delta:
  // 0 = no change
  // 1 = one step clockwise
  // 2 = two steps in either direction
  // 3 = one step counter clockwise
  switch(delta) {
    case 1:
      right();
      prevDelta = delta;
      //console.log(count);
      break;
    case 3:
      left();
      prevDelta = delta;
      //console.log(count);
      break;
    case 2:
      //console.log('-');
      if(prevDelta == 1) {
        right();
      }
      if(prevDelta == 3) {
        left();
      }
      break;
  }
}

function right() {
  request('http://localhost:5000/movement/right', function(err,res,body) {});
}

function left() {
  request('http://localhost:5000/movement/left', function(err,res,body) {});
}

process.on('SIGINT', exit);

