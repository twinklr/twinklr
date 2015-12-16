var app = app || {}; 
app.Stave = Backbone.View.extend({
  el: '#stave',

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

    var svg = $('#stave');
    this.width = svg.width();
    this.height = svg.height();
    svg.attr('width', svg.width() );
    svg.attr('height', svg.height() );

    this.vPadding = 50;
    this.hPadding = 80;

    this.staveWidth = this.width - (this.hPadding*2);
    this.staveHeight = this.height - (this.vPadding*2);
    this.lineHeight = this.staveHeight / (this.allNotes.length-1)
    this.noteRadius = this.lineHeight/2;

    this.snap = Snap('#stave');

    //app.playhead = new app.Playhead(this.snap,this.width,this.height,this); 

    /*
     * And finally, an initial render.
     */

    this.render();
  },

  render: function() {
    var that = this;

    var svg = $("svg#stave");
    var w = svg.width();
    var h = svg.height();

    if(!this.hasStave) {
      this.rendering.drawStave(this.snap, w, h, this);
    }

    //if(!this.playhead) {
      //this.playhead = new app.Playhead(snap,w,h,this);
    //}

    //this.rendering.drawPlayHead(snap, w, h, this);

    //this.rendering.drawNotes(ctx, w, h, this);
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
      this.playhead.move(-2);
    } else {
      this.playhead.move(+2);
    }

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
    drawStave: function(snap, w, h, scope) {
      var lineWidth = 1;
      var strokeStyle = "#666";

      // first, a box round the edge
      snap.rect(scope.hPadding, scope.vPadding, scope.staveWidth, scope.staveHeight).attr({stroke: strokeStyle,
                                                                                                    fill: 'none'});

      // next, a thick starting line
      var fill = "#666";
      snap.rect(scope.hPadding, scope.vPadding, 5, scope.staveHeight).attr({fill: fill});


      // now, draw the right number of lines
      for (var i = scope.allNotes.length-1; i >= 0; i--) {
        var x1 = scope.hPadding;
        var y1 = scope.vPadding + (i * scope.lineHeight);
        var x2 = x1 + scope.staveWidth;
        var y2 = scope.vPadding + (i * scope.lineHeight);
        snap.line(x1,y1,x2,y2).attr({stroke: strokeStyle});
      };
      
      scope.hasStave = true;
    },

    drawPlayHead(snap,w,h,scope) {
      // if no playhead
      if(!scope.playhead) {
        scope.playhead = snap.line(0,0,0,0).attr({id: 'playhead'});

      }
      var playHeadPos = scope.playHeadPos + scope.hPadding;
      scope.playhead.attr({x1: playHeadPos,
                          y1:0,
                          x2:playHeadPos,
                          y2: h});
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
