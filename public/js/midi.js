var app = app || {};

function Midi( midiAccess ) {

  this.midiAccess = midiAccess;
  this.transpose = 0;
  this.gateTime = 250;
  this.selectedOutput = null;

  var octaves = [3,4,5,6];
  var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  this.allNotes = [];

  for(var i = 0; i < octaves.length; i++) {
    for(var j = 0; j < notes.length; j++) {
      var octave = octaves[i];
      var note = notes[j];

      var string = note + octave;
      this.allNotes.push(string.toLowerCase());
    }
  }
}

Midi.prototype.listOutputs = function() {
  var outputs = this.midiAccess.outputs.values();
  var o = [];
  for (var output = outputs.next(); output && !output.done; output = outputs.next()) {
    // each time there is a midi message call the onMIDIMessage function
    o.push({name: output.value.name, id: output.value.id, done: output.value.done});
  }
  return o;
}

Midi.prototype.noteValue = function(noteString) {
  var CTHREE = 60;

  if(this.allNotes.indexOf(noteString.toLowerCase()) > 0) {
    return CTHREE + this.allNotes.indexOf(noteString.toLowerCase()) + parseInt(this.transpose);
  }
}

Midi.prototype.selectOutput = function(outputId) {
  this.selectedOutput = this.midiAccess.outputs.get(outputId);
  console.log("Selecting MIDI output", this.selectedOutput);
}

Midi.prototype.play = function(noteString) {
  var that = this;

  console.log("I should play", noteString, "which is", this.noteValue(noteString));
  if(this.selectedOutput) {
      //if(this.prevNoteString && (this.prevNoteString != noteString)) {
        // send prev note off
        //this.selectedOutput.send( [0x80, this.noteValue(this.prevNoteString), 32] );          
      //}

      this.selectedOutput.send( [0x90, this.noteValue(noteString), 32] );          

      setTimeout(function() {
        that.selectedOutput.send( [0x80, that.noteValue(noteString), 32] );          
      },this.gateTime);
      this.prevNoteString= noteString;
  }
}

Midi.prototype.panic = function() {
  if(this.selectedOutput) {
    for(var i = 0; i < this.allNotes.length; i++) {
      this.selectedOutput.send( [0x80, this.noteValue(this.allNotes[i]), 32] );          
    }
  }
}

window.addEventListener('load', function() {   
  navigator.requestMIDIAccess().then( 
   function(midiAccess) {
      // successful initialisation
      app.midi = new Midi(midiAccess);
      //console.log("Created midi", app.midi);
    }, 
    function() {
    // error
    console.log("Midi error");
  });
});
