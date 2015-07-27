var app = app || {};

app.Tune = Backbone.Collection.extend({
    model: app.Note,

    addNote: function(x,y, data) {
      this.add({
        x:x,y:y,
        name:data.name,
        color: data.color,
        soundIndex: data.soundIndex
      });
    }
});
