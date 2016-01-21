var app = app || {};

app.Tune = Backbone.Collection.extend({
    model: app.Note,
    comparator: 'x',

    initialize: function() {
      this.on('add', function(addee) {
        console.log("Added: ", addee);
      });

      this.on('add remove', this.sort);
    },

    addNote: function(x,y, index) {
      var n = this.add({
        x:x,
        y:y,
        index: index,
        scaleIndex: index % 7,
      });
      this.trigger('noteMade', n);

      var nv = new app.NoteView({model: n});
      app.noteViewManager.add(nv);
    },
});
