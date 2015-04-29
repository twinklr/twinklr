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

    this.collection.bind('change remove add reset', function() {
      console.log('Re-rendering stave.');
      this.render();
    }, this);

    this.render();
  },

  render: function() {
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

    var staveHeight = this.height - (this.vPadding*2);
    var lineHeight = staveHeight / this.noteCount;

    for (var i = this.noteCount - 1; i >= 0; i--) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(this.hPadding, this.vPadding + (i * lineHeight));
      ctx.lineTo(w-this.hPadding, this.vPadding + (i * lineHeight));
      ctx.stroke();
    };

    // for each note, draw a note
      // if it's the highlighted note, make it green
    // draw the timeline
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(50, 255, 0, 0.6)' // green.
    var playHeadPos = this.playHeadPos + this.hPadding;
    ctx.moveTo(playHeadPos, 0);
    ctx.lineTo(playHeadPos, h);
    ctx.stroke();
  },

  click: function(event) {
    console.log(event);
    // get the co-ordinates
    // for each note
      // are the co-ords within a note? if so, remove that note
    // else
      // coerece to a stave on the y-axis
      // add a note
  },

  mousewheel: function(event, delta) {
    console.log(event);
    // advance the playhead
    event.preventDefault();

    if (delta > 0) {
      this.playHeadPos--;
    } else {
      this.playHeadPos++;
    }

    if(this.playHeadPos < 0) {
      // loop back to end
      this.playHeadPos = this.width - (this.hPadding*2);
    } else if(this.playHeadPos > (this.width-(this.hPadding*2))) {
      this.playHeadPos = 0;
    }

    console.log(delta);
    console.log(this.playHeadPos);

    this.render();

    // if it intersects with any notes
    // for each note it intersects with
      // play that note
      // make that the highlighted note

  }

});