var app = app || {};

app.dispatcher = _.clone(Backbone.Events);

app.dispatcher.on('mousewheelUpdate', function(delta) {
  window.playhead.trigger('mousewheelUpdate', delta);
});

app.dispatcher.on('noteMade', function(delta) {
  window.playhead.trigger('mousewheelUpdate', delta);
});

app.dispatcher.on('removeNote', function(note) {
  window.tune.remove(note);
  app.noteViewManager.deleteNoteView(note.cid);
  console.log("Removing note from tune");
});

app.dispatcher.on('playheadMoved', function(pos) {
  window.stave.playNotesAt(pos);
});

app.dispatcher.on('widthUpdated', function(pos) {
  window.stave.updateWidth(event.offsetX);
  window.playhead.updateWidth(event.offsetX);
});

app.dispatcher.on('tidyNotes', function() {
  console.log('tidying notes');

  // find all the notes whose x value > stave length
  var notes = window.tune.filter(function(note) {
    console.log("comparing", note.get('x'), window.stave.staveWidth);
    return note.get('x') > window.stave.staveWidth;
  });

  console.log(notes.length, 'notes to tidy');

  _.each(notes, function(note) {
    app.dispatcher.trigger('removeNote', note);
  });
});
