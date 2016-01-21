var app = app || {}; 
app.NoteView = Backbone.View.extend({
  tagName: 'circle',

  initialize: function() {
    this.render();
    
  },

  render: function() {
    var c = window.stave.snap.circle(this.absX(),
                                     this.absY(),
                                     0).attr({'data-cid': this.model.cid,
                                       'class': this.noteClass()}).animate({r: window.stave.noteRadius}, 30);

    var that = this;

    $("circle[data-cid="+this.model.cid+"]").on('click', function(e) {
      if(app.dim) {
        return;
      }
      app.dispatcher.trigger('removeNote', that.model);
      e.stopPropagation();
    });
    
  },

  removeSvg: function() {
    var that = this;

    var thisNoteSvg = $("circle[data-cid="+this.model.cid+"]")[0];

    Snap(thisNoteSvg).animate({r: 0}, 50, function() {
      $(this).remove(); // remove the jQuery element
      that.remove(); // remove the view
    });
  },

  absX: function() {
    return this.model.absX();
  },
  absY: function() {
    return this.model.absY();
  },

  color: function() {
    return this.model.get('color');
  },

  noteClass: function() {
    var index = app.soundBox.getScaleIndexFor(this.model);
    return "note" + index;
  },

  updateNoteClass: function() {
    var that = this;

    var thisNoteSvg = $("circle[data-cid="+this.model.cid+"]")[0];

    Snap(thisNoteSvg).attr({'class': that.noteClass()});
  }

});
