var app = app || {};

app.Stave = Backbone.View.extend({
  el: '#stave-canvas',

  events: {
    "click": "click",
    'mousewheel': 'mousewheel',
  },

  initialize: function( tune ) {
    this.collection = tune;

    this.playHeadPos = 0;
    this.currentNoteIndices = [];
    this.noteCount = 8;

    var c = $('#stave-canvas');
    this.width = c.width();
    this.height = c.height();
    c.attr('width', c.width() );
    c.attr('height', c.height() );

    this.vPadding = 50;
    this.hPadding = 50;

    this.staveHeight = this.height - (this.vPadding*2);
    this.lineHeight = this.staveHeight / this.noteCount;

    this.collection.bind('change remove add reset', function() {
      console.log('Re-rendering stave.');
      this.render();
    }, this);

    this.render();
  },

  render: function() {
    var that = this;

    var c = $('#stave-canvas');
    var ctx = c[0].getContext('2d');
    var w = c.width();
    var h = c.height();

    // draw the background
    ctx.fillStyle = "#DBE3BC";
    ctx.fillRect(0, 0, w, h);

    // draw the staves

    // first, a box round the edge
    ctx.strokeStyle = "#222";
    ctx.strokeRect(this.hPadding, this.vPadding, (this.width - this.hPadding*2), (this.height - this.vPadding*2));

    // next, a thick starting line
    ctx.fillStyle = "#222";
    ctx.fillRect(this.hPadding, this.vPadding, 5, (this.height - this.vPadding*2));

    // now, draw the right number of lines

    for (var i = this.noteCount - 1; i >= 0; i--) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(this.hPadding, this.vPadding + (i * this.lineHeight));
      ctx.lineTo(w-this.hPadding, this.vPadding + (i * this.lineHeight));
      ctx.stroke();
    };

    // for each note, draw a note
    this.collection.each(function(note) {
      var radius = that.lineHeight/2;

      // if it's the highlighted note, make it green
      if( (that.absolutePlayHeadPos() >= (note.get('x')-radius)) &&
        (that.absolutePlayHeadPos() < (note.get('x')+radius))
       ) {
        ctx.fillStyle = 'rgb(50, 255, 0)' // green.
      } else {
        ctx.fillStyle = "#222";
      }

      // draw the blob itself.
      ctx.beginPath();
      var x = note.get('x');
      var y = note.get('y');
      var startAngle = 0;
      var endAngle = 2 * Math.PI
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.fill();
    });

    // draw the green line to indicate playhead position
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(50, 255, 0, 0.6)' // green.
    var playHeadPos = this.playHeadPos + this.hPadding;
    ctx.moveTo(playHeadPos, 0);
    ctx.lineTo(playHeadPos, h);
    ctx.stroke();
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
    if(add) {
      // TODO: coerece to a pitch on the y-axis
      var pitchIndex = this.getPitchIndexForEvent(event);
      console.log("Pitch index:", pitchIndex);
      // add a note
      if(pitchIndex >= 0 && pitchIndex <= this.noteCount) {
        this.collection.addNote(event.offsetX, event.offsetY, pitchIndex);
      }
    }
  },

  mousewheel: function(event, delta) {
    // advance the playhead
    event.preventDefault();

    if (delta > 0) {
      this.playHeadPos = this.playHeadPos - 2;
    } else {
      this.playHeadPos = this.playHeadPos + 2;
    }

    if(this.playHeadPos < 0) {
      // loop back to end
      this.playHeadPos = this.width - (this.hPadding*2);
    } else if(this.playHeadPos > (this.width-(this.hPadding*2))) {
      this.playHeadPos = 0;
    }

    this.render();

    // if it intersects with any notes
    var intersectingNotes = this.notesIntersectingX(this.absolutePlayHeadPos());
    console.log(intersectingNotes);
    // for each note it intersects with
    _.each(intersectingNotes, function(note) {
      // play that note
      console.log("Play pitch", note.get('pitchIndex'));
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

    var radius = this.lineHeight / 2;

    return ((mouseX > noteX-radius) && 
            (mouseX < noteX+radius) && 
            (mouseY > noteY-radius) && 
            (mouseY < noteY+ radius));
  },

  notesIntersectingX: function(x) {
    var radius = this.lineHeight / 2;

    return this.collection.filter(function(note) {
      var noteX = note.get('x');

      return ((x > noteX-radius) && (x < noteX+radius))
    });
  }
});
