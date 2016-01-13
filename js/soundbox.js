var app = app || {};

app.soundBox = {
  noteNames: ['c5','d5','e5','f5','g5','a5','b5',
        'c6','d6','e6','f6','g6','a6','b6','c7'],

  playedNotes: [],

  setup: function() {
    this.scaleType = 'major';
    this.scaleRoot = 'c';
    this.sounds = [];

    for(i=0; i<this.noteNames.length; i++) {
      var sound = new buzz.sound("sounds/"+this.noteNames[i], {
        formats: [ 'mp3'],
        preload: true,
        autoplay: false,
        loop: false,
      });
      sound.setVolume(50);
      this.sounds.push(sound);
    }

    console.log('sounds loaded');
  },

  playNote: function(note) {
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

  updateScaleRoot: function(root) {
    this.scaleRoot = root;
  },

  updateScaleType: function(type) {
    this.scaleType = type;
  },

}

app.soundBox.setup();
