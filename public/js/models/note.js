var app = app || {};

app.Note = Backbone.Model.extend({
  absX: function() {
    return this.get('x') + window.stave.hPadding;
  },
  absY: function() {
    return this.get('y') + window.stave.vPadding;
  },

});
