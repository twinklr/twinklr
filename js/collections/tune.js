var app = app || {};

app.Tune = Backbone.Collection.extend({
    model: app.Note,

    addNote: function(x,y) {
      this.add({x:x,y:y});
    }
});