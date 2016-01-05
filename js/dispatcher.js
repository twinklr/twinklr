var app = app || {};

app.dispatcher = _.clone(Backbone.Events);

app.dispatcher.on('mousewheelUpdate', function(delta) {
  window.playhead.trigger('mousewheelUpdate', delta);
});

app.dispatcher.on('noteMade', function(delta) {
  window.playhead.trigger('mousewheelUpdate', delta);
});

app.dispatcher.on('noteRemoved', function(note) {
  window.tune.remove(note);
  console.log("Removing note from tune");
});

app.dispatcher.on('playheadMoved', function(pos) {
  window.stave.playNotesAt(pos);
});

app.dispatcher.on('widthUpdated', function(pos) {
  window.stave.updateWidth(event.offsetX);
  window.playhead.updateWidth(event.offsetX);
});
