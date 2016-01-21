var app = app || {}; 
app.Stave = Backbone.View.extend({
  el: '#stave',

  events: {
    'mousemove': 'mousemove',
    'mousedown': 'mousedown',
    'mouseup': 'mouseup',
    'mousewheel': 'mousewheel',
    'click': 'click',
  },

  initialize: function( tune ) {
    var that = this;

    this.collection = tune;

    this.noteCount = 15;
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
    this.staveHeight = this.height - (this.vPadding*3);
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

    $("rect.stave").remove();
    $("line.stave-line").remove();
    $("rect.stave-end").remove();

    // first, a box round the edge
    this.snap.rect(this.hPadding, 
                   this.vPadding, 
                   this.staveWidth, 
                   this.staveHeight).attr({stroke: strokeStyle, 
                                           fill: 'none'}).addClass('stave');

    // next, a thick starting line
    var fill = "#666";
    this.snap.rect(this.hPadding,
                   this.vPadding, 
                   5, 
                   this.staveHeight).attr({fill: fill}).addClass('stave-end');


    // now, draw the right number of lines
    for (var i = this.lineCount; i >= 0; i--) {
      var x1 = this.hPadding;
      var y1 = this.vPadding + (i * this.lineHeight);
      var x2 = x1 + this.staveWidth;
      var y2 = this.vPadding + (i * this.lineHeight);
      this.snap.line(x1,y1,x2,y2).attr({stroke: strokeStyle}).addClass('stave-line');
    };

    // now stick them all at the beginning of the element, to layer them
    // correctly
    var lines = Snap.selectAll('line');
    _.each(lines, function(line) {
      var l = line.remove();
      that.snap.prepend(l);
    });

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

  noteIntersectsPos: function(note,pos) {
    return (pos >= (note.get('x')-this.noteRadius)) &&
      (pos < (note.get('x')+this.noteRadius));
  },

  mousewheel: function(event, delta) {
    event.preventDefault();
    this.trigger('mousewheelUpdate', delta);
  },

  click: function(event) {
    // TODO: if click lies inside a note, remove it
    // tell the collection to add a note
    // the collection might reject this based on where it is.
    if(app.dim) {
      return;
    }

    var add = true;

    if(add && this.insideStave(event.offsetX, event.offsetY)) {
      // we coerce to an index because that's calculated by the stave, visually
      var x = event.offsetX - this.hPadding;
      var y = event.offsetY - this.vPadding;

      var pitchIndex = this.getPitchIndexForY(y);
      console.log("Adding note at ", x,y,pitchIndex);
      var n = this.collection.addNote(x,y, pitchIndex);
    }
  },

  mousemove: function(event) {
    if((app.editMode == 'alter-sequence-length') && this.mouseIsDown) {
      //console.log(event.offsetX);
      app.dispatcher.trigger('widthUpdated', event.offsetX);
    }
  },

  mousedown: function (event) {
    this.mouseIsDown = true;
  },

  mouseup: function (event) {
    this.mouseIsDown = false;
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

  playNotesAt: function(pos) {
    var that = this;
    
    // for each note
    this.collection.each(function(note, i) {
      var noteX = note.get('x');

      if(that.noteIntersectsPos(note,pos)) {

        app.dispatcher.trigger('playNote', note);
        
        var noteObject = Snap("circle[data-cid="+note.cid+"]");
        if(!noteObject.hasClass('highlighted')) {
          noteObject.addClass('highlighted');
          noteObject.animate({strokeWidth: 5}, 50);
        }
      } else {
        note.set('playing', false);
        var noteObject = Snap("circle[data-cid="+note.cid+"]");
        if(noteObject.hasClass('highlighted')) {
          noteObject.animate({strokeWidth: 0}, 150, function() {
            noteObject.removeClass('highlighted');
          });
        }
      }
    });
  },

  updateWidth: function(offsetWidth) {
    var finalOffset = 0;
    if(offsetWidth > (this.width - this.hPadding)) {
      // if the offset is off to the right
      finalOffset = 0;
    } else if(offsetWidth < (this.hPadding + 250)) {
      // if the offset is too narrow
      finalOffset = this.width - 250 - this.hPadding - this.hPadding;
    } else {
      finalOffset = this.width - offsetWidth - this.hPadding;
    }

    this.staveWidth = this.width - (this.hPadding*2) - finalOffset;
    this.render();
  }, 

  updateWidthFromData: function(offsetWidth) {
    this.staveWidth = offsetWidth;
    this.render();
  }, 

});
