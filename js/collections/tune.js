var app = app || {};

app.Tune = Backbone.Collection.extend({
    model: app.Note,

    initialize: function() {
      this.noteNames = ['c5','d5','e5','f5','g5','a5','b5',
        'c6','d6','e6','f6','g6','a6','b6','c7'];

      this.noteColors = ['f5786b','ffce2a', 'feb2c4', 'c8d657', 'b03ca4', 'ffb326', '7ed4d2'];

      console.log('loading sounds');

      /* 
      * Set up sounds
      * TODO: overhaul this;
      * */

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

      this.sounds.reverse(); // because stave goes bottom to top

      console.log('sounds loaded');

      /*
       * now set up a list of all possible notes
       */

      this.allNotes = [];

      for(i=0; i<this.noteNames.length; i++) {
        var noteData = {
          name: this.noteNames[this.noteNames.length-1-i],
          color: this.noteColors[(this.noteNames.length - 1 - i) %7],
          soundIndex: i
        }
        this.allNotes.push(noteData);
      }

      console.log("Allnotes:", this.allNotes);
    },

    addNote: function(x,y, data) {
      this.add({
        x:x,y:y,
        name:data.name,
        color: data.color,
        soundIndex: data.soundIndex
      });
    }
});
