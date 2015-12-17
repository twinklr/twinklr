var app = app || {};

app.dispatcher = _.clone(Backbone.Events);

app.dispatcher.on('mousewheelUpdate', function(delta) {
  window.playhead.trigger('mousewheelUpdate', delta);
});

app.dispatcher.on('noteMade', function(delta) {
  window.playhead.trigger('mousewheelUpdate', delta);
});
