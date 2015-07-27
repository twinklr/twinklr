var app = app || {};

app.Midi = Backbone.View.extend({
  initialize: function( tune ) {
    var that = this;

    this.midiNotes = {'c5':72,
      'd5':74,
      'e5':76,
      'f5':77,
      'g5':79,
      'a5':81,
      'b5':83,
      'c6':84,
      'd6':86,
      'e6':88,
      'f6':89,
      'g6':91,
      'a6':93,
      'b6':95,
      'c7':96,
    };

    window.addEventListener('load', function() {   
      navigator.requestMIDIAccess().then( 
        that.onMIDIInit, 
        that.onMIDISystemError );
    });

    this.prevNote = null;

    Backbone.on('notePlayed', function(note) {
      console.log("** Midi Note", note, that.midiNotes[note]);

      if(app.midiOut) {
        if(that.prevNote && (that.prevNote != note)) {
          // send prev note off
          app.midiOut.send( [0x80, that.midiNotes[note], 32] );          
        }

        app.midiOut.send( [0x90, that.midiNotes[note], 32] );

        setTimeout(function() {
          app.midiOut.send( [0x80, that.midiNotes[note], 32] );          
        },5000)
        that.prevNote = note;

      }
    });
  },

  onMIDIInit: function( midi ) {
    console.log(midi.outputs.size);
    console.log(midi.inputs.size);
    var outputCount = 0;

    app.midiAccess = midi;
    if(app.midiAccess.outputs.size > 0) {
      var firstKey = app.midiAccess.outputs.keys().next().value;
      app.midiOut = app.midiAccess.outputs.get(firstKey);
      console.log("Set up midi out:", app.midiOut);
    }
  },

  onMIDISystemError: function( midi ) {
    console.log("Midi error");
  }
});
