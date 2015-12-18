var app = app || {}; 
app.NoteView = Backbone.View.extend({
  tagName: 'circle',

  initialize: function() {
    this.render();
    
  },

  render: function() {
    var c = window.stave.snap.circle(this.absX(), this.absY(),window.stave.noteRadius).attr({fill: this.color()}).attr('data-cid', this.model.cid)

    var that = this;

    $("circle[data-cid="+this.model.cid+"]").on('click', function(e) {
      app.dispatcher.trigger('noteRemoved', that.model);
      $(this).remove(); // remove the jQuery element
      that.remove(); // remove the view
      e.stopPropagation();
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
});
