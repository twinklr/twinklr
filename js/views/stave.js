var app = app || {}; 
app.Stave = Backbone.View.extend({
  el: '#stave',

  events: {
    'mousewheel': 'mousewheel',
  },

  initialize: function( tune ) {
    var that = this;

    this.collection = tune;

    this.noteCount = this.collection.allNotes.length;
    this.lineCount = this.noteCount - 1;

    /*
     * Set up events
     */

    //this.collection.bind('change remove add reset', function() {
      //console.log('Re-rendering stave.');
      //this.render();
    //}, this);

    /* 
     * Set up stave visuals
     */

    this.width = this.$el.width();
    this.height = this.$el.height();
    this.$el.attr('width', this.$el.width() );
    this.$el.attr('height', this.$el.height() );

    this.vPadding = 50;
    this.hPadding = 80;

    this.staveWidth = this.width - (this.hPadding*2);
    this.staveHeight = this.height - (this.vPadding*2);
    this.lineHeight = this.staveHeight / (this.lineCount)
    this.noteRadius = this.lineHeight/2;

    this.snap = Snap('#stave');

    /*
     * And finally, an initial render.
     */

    this.render();
  },

  render: function() {
    var that = this;

    var lineWidth = 1;
    var strokeStyle = "#666";

    // first, a box round the edge
    this.snap.rect(this.hPadding, 
                   this.vPadding, 
                   this.staveWidth, 
                   this.staveHeight).attr({stroke: strokeStyle, 
                                           fill: 'none'});

    // next, a thick starting line
    var fill = "#666";
    this.snap.rect(this.hPadding,
                   this.vPadding, 
                   5, 
                   this.staveHeight).attr({fill: fill});


    // now, draw the right number of lines
    for (var i = this.lineCount; i >= 0; i--) {
      var x1 = this.hPadding;
      var y1 = this.vPadding + (i * this.lineHeight);
      var x2 = x1 + this.staveWidth;
      var y2 = this.vPadding + (i * this.lineHeight);
      this.snap.line(x1,y1,x2,y2).attr({stroke: strokeStyle});
    };

    this.hasStave = true;
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

  mousewheel: function(event, delta) {
    event.preventDefault();
    app.dispatcher.trigger('mousewheelUpdate', delta);
  }

});
