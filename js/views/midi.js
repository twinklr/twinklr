var app = app || {};

app.Midi = Backbone.View.extend({
  initialize: function( tune ) {
    var that = this;

    this.midiNotes = [60,62,64,65,67,69,71,72];

    window.addEventListener('load', function() {   
      navigator.requestMIDIAccess().then( 
        that.onMIDIInit, 
        that.onMIDISystemError );
    });

    this.prevNoteIndex = null;

    Backbone.on('notePlayed', function(note) {
      console.log("** Note", note);

      noteIndex = 7 - note;

      if(app.midiAccess && app.midiAccess.outputs.size > 0) {
        var currentPort = document.getElementById("outputportselector").value
        var out = app.midiAccess.outputs.get(currentPort);

        if(that.prevNoteIndex && that.prevNoteIndex != noteIndex) {
          // send prev note off
          out.send( [0x80, that.midiNotes[that.prevNoteIndex], 32] );          
        }

        out.send( [0x90, that.midiNotes[noteIndex], 32] );

        setTimeout(function() {
          out.send( [0x80, that.midiNotes[noteIndex], 32] );          
        },5000)
        that.prevNoteIndex = noteIndex;

      }
    });
  },

  onMIDIInit: function( midi ) {
    console.log(midi.outputs.size);
    console.log(midi.inputs.size);
    var outputCount = 0;

    midi.outputs.forEach( function( key, port ) {
      console.log(key,port);
      var opt = document.createElement("option");
      opt.text = [key.manufacturer,key.name].join(' ');
      opt.value = port;
      document.getElementById("outputportselector").add(opt);
    });

    if(midi.outputs.size > 0) {
      $("#outputportselector").show();
    }

    app.midiAccess = midi;
  },

  onMIDISystemError: function( midi ) {
    console.log("Midi error");
  }
});