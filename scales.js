var octaves = [4,5,6];
var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var root = process.argv[2].toUpperCase();

if(!(process.argv[2] && process.argv[3])) {
  console.log("Usage: node scales.js ROOT SCALE");
  process.exit();
}

if(notes.indexOf(root) < 0) {
  console.log("Not a valid note");
  process.exit();
}

// here are our scales as lists of intervals

var scales = { major:      [2, 2, 1, 2, 2, 2, 1],
               minor:      [2, 1, 2, 2, 1, 2, 2],
               dorian:     [2, 1, 2, 2, 2, 1, 2],
               lydian:     [2, 2, 2, 1, 2, 2, 1],
               mixolydian: [2, 2, 1, 2, 2, 1, 2],
               phrygian:   [1, 2, 2, 2, 1, 2, 2],
               locrian:    [1, 2, 2, 1, 2, 2, 2],
               pentatonic: [3, 2, 2, 3, 2],
               blues:      [3, 2, 1, 1, 3, 2],
}

// let's set up a list of all possible notes

var allNotes = []

for(var i = 0; i < octaves.length; i++) {
  for(var j = 0; j < notes.length; j++) {
    var octave = octaves[i];
    var note = notes[j];

    var string = note + octave;
    allNotes.push(string);
  }
}

// shuffle off any notes before our chosen root.

while(allNotes[0].replace(/\d/,'') != root) {
  allNotes.shift();
}

var allNotesBeginningWithRoot = allNotes;
var scale = scales[process.argv[3]];

outputScale = [];

outputScale.push(allNotesBeginningWithRoot[0]);

while(allNotesBeginningWithRoot.length > 0) {
  for(var i = 0; i < scale[0]; i++) {
    allNotesBeginningWithRoot.shift();
  }
  outputScale.push(allNotesBeginningWithRoot[0]);

  // rotate the array
  var first = scale.shift();
  scale.push(first);
}

// remove any nils
for(var i = 0; i < outputScale.length; i++) {
  if(!outputScale[i]) {
    outputScale.splice(i,1);
  }
}

// limit scale to 15 notes max

outputScale = outputScale.slice(0,15);

console.log(outputScale.length + " notes");
console.log(outputScale);

