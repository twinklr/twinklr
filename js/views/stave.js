var app = app || {};

app.Stave = Backbone.View.extend({
  el: '#stave-canvas',

  events: {
    "click": "click",
    "mousedown": "mousedown",
    "mouseup": "mouseup",
    'mousewheel': 'mousewheel',
  },

  initialize: function( tune ) {
    var that = this;

    this.collection = tune;
    this.playHeadPos = 0;
    this.currentNoteIndices = [];
    this.direction = 'forward';
    this.playedNotes = [];

    /*
     * Set up events
     */

    this.collection.bind('change remove add reset', function() {
      console.log('Re-rendering stave.');
      this.render();
    }, this);

    /* 
    * Set up sounds
    * */

    var noteNames = ['c5','d5','e5','f5','g5','a5','b5',
                     'c6','d6','e6','f6','g6','a6','b6','c7'];

    var noteColors = ['f5786b','ffce2a', 'feb2c4', 'c8d657', 'b03ca4', 'ffb326', '7ed4d2'];

    console.log('loading sounds');

    this.sounds = [];

    for(i=0; i<noteNames.length; i++) {
      var sound = new buzz.sound("sounds/"+noteNames[i], {
        formats: [ 'mp3'],
        preload: true,
        autoplay: false,
        loop: false,
      });
      sound.setVolume(50);
      that.sounds.push(sound);
    }

    this.sounds.reverse(); // because stave goes bottom to top

    console.log('sounds loaded');

    /*
     * now set up a list of all possible notes
     */

    this.allNotes = [];

    for(i=0; i<noteNames.length; i++) {
      var noteData = {
        name: noteNames[noteNames.length-1-i],
        color: noteColors[(noteNames.length - 1 - i) %7],
        soundIndex: i
      }
      that.allNotes.push(noteData);
    }

    console.log("Allnotes:", this.allNotes);

    /* 
     * Set up stave visuals
     */

    var c = $('#stave-canvas');
    this.width = c.width();
    this.height = c.height();
    c.attr('width', c.width() );
    c.attr('height', c.height() );

    this.vPadding = 50;
    this.hPadding = 50;

    this.staveHeight = this.height - (this.vPadding*2);
    this.lineHeight = this.staveHeight / (this.allNotes.length-1)
    this.noteRadius = this.lineHeight/2;

    /*
     * And finally, an initial render.
     */

    this.render();
  },

  render: function() {
    var that = this;

    var c = $('#stave-canvas');
    var ctx = c[0].getContext('2d');
    var w = c.width();
    var h = c.height();

    this.rendering.drawStave(ctx, w, h, this);

    this.rendering.drawPlayHead(ctx, w, h, this);

    this.rendering.drawNotes(ctx, w, h, this);
  },

  click: function(event) {
    var add = true;

    // get the co-ordinates
    // for each note
    this.collection.each(function(note) {
      // are the co-ords within that note? if so, remove that note
      if(this.noteIntersectsEvent(note, event)) {
        this.collection.remove(note);
        add = false;
      } 
    }, this);

    // and if we didn't intersect any notes, it's OK to add one.
    if(add) {
      // coerece to a pitch on the y-axis
      var pitchIndex = this.getPitchIndexForEvent(event);
      // add a note
      if(pitchIndex >= 0 && pitchIndex < this.allNotes.length) {
        console.log("Adding note", this.allNotes[pitchIndex]);
        this.collection.addNote(event.offsetX, event.offsetY, this.allNotes[pitchIndex]);
      }
    }
  },

  mousedown: function(event) {
    $("canvas").addClass('mousedown');
  },

  mouseup: function(event) {
    $("canvas").removeClass('mousedown');
  },

  mousewheel: function(event, delta) {
    // advance the playhead
    event.preventDefault();

    if (delta > 0) {
      this.playHeadPos = this.playHeadPos - 2;
      if(this.direction == 'forward') {
        this.direction = 'backward';
        this.playedNotes = [];
      }
    } else {
      this.playHeadPos = this.playHeadPos + 2;
      if(this.direction == 'backward') {
        this.direction = 'forward';
        this.playedNotes = [];
      }
    }

    if(this.playHeadPos < 0) {
      // loop back to end
      this.playHeadPos = this.width - (this.hPadding*2);
      this.playedNotes = [];
    } else if(this.playHeadPos > (this.width-(this.hPadding*2))) {
      this.playHeadPos = 0;
      this.playedNotes = [];
    }

    this.render();

    // if it intersects with any notes
    var intersectingNotes = this.notesIntersectingX(this.absolutePlayHeadPos());
    // console.log(intersectingNotes);
    // for each note it intersects with
    var that = this;
    _.each(intersectingNotes, function(note) {
       //play that note
      if(!_.contains(that.playedNotes, note)) {
        that.sounds[note.get('soundIndex')].stop();
        that.sounds[note.get('soundIndex')].play();
        Backbone.trigger('notePlayed', note.get('name'));
        that.playedNotes.push(note);
      }
    });
  },

  absolutePlayHeadPos: function() {
    return this.playHeadPos + this.hPadding;
  },

  getPitchIndexForEvent: function(event) {
    var y = event.offsetY;

    return Math.floor((y-(this.vPadding/2)) / this.lineHeight);
  },

  noteIntersectsEvent: function(note,event) {
    var mouseX = event.offsetX;
    var mouseY = event.offsetY;
    var noteX = note.get('x');
    var noteY = note.get('y');

    return ((mouseX > noteX-this.noteRadius) && 
            (mouseX < noteX+this.noteRadius) && 
            (mouseY > noteY-this.noteRadius) && 
            (mouseY < noteY+ this.noteRadius));
  },

  notesIntersectingX: function(x) {
    var that = this;
    return this.collection.filter(function(note) {
      var noteX = note.get('x');

      return ((x > noteX-that.noteRadius) && (x < noteX+that.noteRadius))
    });
  },

  noteIsHighlighted: function(note) {
    return (this.absolutePlayHeadPos() >= (note.get('x')-this.noteRadius)) &&
      (this.absolutePlayHeadPos() < (note.get('x')+this.noteRadius));
  },

  rendering: {
    drawStave: function(ctx, w, h, scope) {
      // draw the background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // draw the staves
      
      ctx.lineWidth = 1;

      // first, a box round the edge
      ctx.strokeStyle = "#666";
      ctx.strokeRect(scope.hPadding, scope.vPadding, (scope.width - scope.hPadding*2), (scope.height - scope.vPadding*2));

      // next, a thick starting line
      ctx.fillStyle = "#666";
      ctx.fillRect(scope.hPadding, scope.vPadding, 5, (scope.height - scope.vPadding*2));

      // now, draw the right number of lines
      for (var i = scope.allNotes.length-1; i >= 0; i--) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(scope.hPadding, scope.vPadding + (i * scope.lineHeight));
        ctx.lineTo(w-scope.hPadding, scope.vPadding + (i * scope.lineHeight));
        ctx.stroke();
      };

    },

    drawPlayHead(ctx,w,h,scope) {
      // draw the red line to indicate playhead position
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgb(156,20,12)' // red.
      var playHeadPos = scope.playHeadPos + scope.hPadding;
      ctx.moveTo(playHeadPos, 0);
      ctx.lineTo(playHeadPos, h);
      ctx.stroke();

    },

    drawNotes(ctx,w,h,scope) {
      // for each note, draw a note
      scope.collection.each(function(note) {
        // if it's the highlighted note, make it red
        if(scope.noteIsHighlighted(note)) {
          ctx.strokeStyle = 'rgb(156,20,21)' // red.

          // now draw the highlight
          ctx.lineWidth = 8;
          ctx.beginPath();
          var x = note.get('x');
          var y = note.get('y');
          var startAngle = 0;
          var endAngle = 2 * Math.PI
          ctx.arc(x, y, scope.noteRadius, startAngle, endAngle);
          ctx.stroke();
        }

        ctx.fillStyle = "#" + note.get('color');
        // now draw the note
        ctx.beginPath();
        var x = note.get('x');
        var y = note.get('y');
        var startAngle = 0;
        var endAngle = 2 * Math.PI
        ctx.arc(x, y, scope.noteRadius, startAngle, endAngle);
        ctx.fill();
      });
    }
  }
});
