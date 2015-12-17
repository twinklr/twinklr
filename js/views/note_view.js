var app = app || {}; 
app.NoteView = Backbone.View.extend({
  tagName: 'circle',

  events: {
    'click': 'click',
  },

  initialize: function() {
    this.render();
    
  },

  render: function() {
    var c = window.stave.snap.circle(this.absX(), this.absY(),window.stave.noteRadius).attr({fill: this.color()}).attr('data-cid', this.model.cid)

    $(c).on('click', function(e) {
      alert(this.dataset.cid);
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

  click: function(e) {
    // collection should listen for this
    alert('click');
  }

});
