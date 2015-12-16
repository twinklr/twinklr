var app = app || {};

app.Playhead = Backbone.Model.extend({
  el: '#playhead',
  // on initialize, it renders itself
  initialize: function(staveSnap,width,height,scope) {
    this.stave = staveSnap;
    this.width = width;
    this.height = height;
    this.scope = scope;
    this.playHeadPos = 0;
    if(!scope.playhead) {
      scope.playhead = this.stave.line(0,0,0,0).attr({id: 'playhead'});

    }
    this.render();
  },

  render: function() {
    var actualPlayHeadPos = this.playHeadPos + this.scope.hPadding;
    this.scope.playhead.attr({x1: actualPlayHeadPos,
                        y1:0,
                        x2:actualPlayHeadPos,
                        y2: this.height});
  },

  move: function(amount) {
    this.playHeadPos = this.playHeadPos + amount;
    this.render();
  }
  // on change, it updates its position
  //
  

});

