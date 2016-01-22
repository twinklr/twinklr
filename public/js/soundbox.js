var app = app || {};

app.soundBox = {
  playedNotes: [],

  scales: { major:      [2, 2, 1, 2, 2, 2, 1],
            minor:      [2, 1, 2, 2, 1, 2, 2],
            dorian:     [2, 1, 2, 2, 2, 1, 2],
            lydian:     [2, 2, 2, 1, 2, 2, 1],
            mixolydian: [2, 2, 1, 2, 2, 1, 2],
            phrygian:   [1, 2, 2, 2, 1, 2, 2],
            locrian:    [1, 2, 2, 1, 2, 2, 2],
            pentatonic: [3, 2, 2, 3, 2],
            blues:      [3, 2, 1, 1, 3, 2],
  },

  setup: function() {
    // first, set up all the sounds
    this.setupAllSounds();

    // then, load the sounds for this particular scale

    this.scaleType = 'major';
    this.scaleRoot = 'c';

    this.loadScaleSounds();
  },

  setupAllSounds: function() {
    this.allNotes = [];
    this.allSounds = [];
    // first, bung all the sounds into an array
    var octaves = [3,4,5,6];
    var notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

    for(var i = 0; i < octaves.length; i++) {
      for(var j = 0; j < notes.length; j++) {
        var octave = octaves[i];
        var note = notes[j];
        var string = note + octave;

        this.allNotes.push(string);
      }
    }

    // now filter out notes we don't have
    
    while(this.allNotes[0] != 'f3') {
      this.allNotes.shift();
    }

    while(this.allNotes[this.allNotes.length-1] != 'f6') {
      this.allNotes.pop();
    }

    console.log(this.allNotes);
    console.log('all notes calculated');

    for(var i = 0; i < this.allNotes.length; i++) {
      var fileString = this.allNotes[i].replace("#", "sharp");
      var sound = new buzz.sound("sounds/plinks/"+fileString, {
        formats: [ 'mp3'],
        preload: true,
        autoplay: false,
        loop: false,
      });
      sound.setVolume(50);
      this.allSounds.push(sound);
    }
    console.log('all sounds loaded');
    console.log(this.allSounds);
  },

  loadScaleSounds: function() {
    // blank sounds
    this.sounds = [];
    this.scaleNotes = [];

    var tempNotes = this.allNotes.slice(0);;
    var tempSounds = this.allSounds.slice(0);;
    // push into a sounds array all the relevant sounds
    // shuffle off any notes before our chosen root.

    console.log(tempNotes);
    while(tempNotes[0].replace(/\d/,'') != this.scaleRoot) {
      tempNotes.shift();
      tempSounds.shift();
    }

    var allNotesBeginningWithRoot = tempNotes;
    var scale = this.scales[this.scaleType];

    console.log("Scale is", scale);


    this.scaleNotes.push(allNotesBeginningWithRoot[0]);
    this.sounds.push(tempSounds[0]);

    while(allNotesBeginningWithRoot.length > 0) {
      for(var i = 0; i < scale[0]; i++) {
        allNotesBeginningWithRoot.shift();
        tempSounds.shift();
      }
      this.scaleNotes.push(allNotesBeginningWithRoot[0]);
      this.sounds.push(tempSounds[0]);

      // rotate the array
      var first = scale.shift();
      scale.push(first);
    }

    // remove any nils
    for(var i = 0; i < this.scaleNotes.length; i++) {
      if(!this.scaleNotes[i]) {
        this.scaleNotes.splice(i,1);
        this.sounds.splice(i,1);
      }
    }

    // limit scale to 15 notes max

    this.scaleNotes = this.scaleNotes.slice(0,15);
    this.sounds = this.sounds.slice(0,15);

    this.playedNotes = [];

    console.log(this.scaleRoot + " " + this.scaleType + " loaded");
    console.log(this.scaleNotes);
  },

  playNote: function(note) {
    console.log("Trying to play note", note.get('index'));
    console.log("Trying to play ", this.scaleNotes[note.get('index')]);
    if(!_.contains(this.playedNotes, note)) {
      this.sounds[note.get('index')].stop();
      this.sounds[note.get('index')].play();
      this.playedNotes.push(note);
    }
    this.currentNote = note;
  },

  clearPlayedNotes: function() {
    this.playedNotes = [];
  },

  updateScale: function(root,type) {
    console.log(root,type);
    if(root) {
      this.scaleRoot = root;
    }

    if(type) {
      this.scaleType = type;
    }
    this.loadScaleSounds();
  },

  updateScaleRoot: function(root) {
    this.scaleRoot = root;
    this.loadScaleSounds();
  },

  updateScaleType: function(type) {
    this.scaleType = type;
    this.loadScaleSounds();
  },

  scaleLength: function() {
    return this.scales[this.scaleType].length;
  },

  getScaleIndexFor: function(note) {
    var i = note.get('index');
    return (i % this.scaleLength()) + 1;
  }

}

app.soundBox.setup();
