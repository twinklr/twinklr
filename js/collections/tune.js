var app = app || {};

app.Tune = Backbone.Collection.extend({
    model: app.Note,

    addNote: function(x,y, pitchIndex) {
      this.add({x:x,y:y,pitchIndex:pitchIndex});
    }
});