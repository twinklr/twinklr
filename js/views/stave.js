var app = app || {}; 
app.Stave = Backbone.View.extend({
  el: '#stave',

  events: {
    'mousewheel': 'mousewheel',
    'click': 'click'
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

  noteIntersectsEvent: function(note,event) {
    var mouseX = event.offsetX;
    var mouseY = event.offsetY;

    return ((mouseX > note.absX()-this.noteRadius) && 
            (mouseX < note.absX()+this.noteRadius) && 
            (mouseY > note.absY()-this.noteRadius) && 
            (mouseY < note.absY()+ this.noteRadius));
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
    this.trigger('mousewheelUpdate', delta);
  },

  click: function(event) {
    // TODO: if click lies inside a note, remove it
    // tell the collection to add a note
    // the collection might reject this based on where it is.
    var add = true;

    console.log("iterating over notes");

    this.collection.each(function(note) {
      // are the co-ords within that note? if so, remove that note
      if(note && this.noteIntersectsEvent(note, event)) {
        $("circle[data-cid="+note.cid+"]").remove();
        this.collection.remove(note);
        this.collection.sort();
        add = false;
      } else {
        //console.log(event.offsetX,event.offsetY, "does not fall in", note.absX(),note.absY());
      }
    }, this);

    
    if(add && this.insideStave(event.offsetX, event.offsetY)) {
      // we coerce to an index because that's calculated by the stave, visually
      var x = event.offsetX - this.hPadding;
      var y = event.offsetY - this.vPadding;

      var pitchIndex = this.getPitchIndexForY(y);
      console.log("Adding note at ", x,y,pitchIndex);
      var n = this.collection.addNote(x,y, pitchIndex);

    }
  },

  insideStave: function(offsetX, offsetY) {
    var left = (offsetX - this.hPadding + (this.lineHeight/2)) > 0;
    var top = (offsetY - this.vPadding + (this.lineHeight/2)) > 0;
    var right = (offsetX - this.staveWidth- this.hPadding - (this.lineHeight/2)) < 0;
    var bottom = (offsetY - this.staveHeight - this.vPadding - (this.lineHeight/2)) < 0;

    return (top && bottom && left && right);
  },

  getPitchIndexForY: function(y) {
    var lineIndex = Math.floor((y-(this.lineHeight/2)) / this.lineHeight) + 1;
    // of course, that's counting from the top down. music is backwards:
    return this.lineCount - lineIndex;
  },

});
