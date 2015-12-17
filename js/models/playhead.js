var app = app || {};

app.Playhead = function(staveSnap,width,height,scope) {
  this.stave = staveSnap;
  this.width = width;
  this.height = height;
  this.scope = scope;
  this.playHeadPos = 0;
  if(!scope.playhead) {
    scope.playhead = this.stave.line(0,0,0,0).attr({id: 'playhead'});

  }

  _.extend(this, Backbone.Events);

  var that = this;

  this.listenTo(scope, "mousewheelUpdate", function(delta) {
    if (delta > 0) {
      that.move(-2);
    } else {
      that.move(+2);
    }
  });

  this.render();
}

app.Playhead.prototype = {
  // on initialize, it renders itself

  render: function() {
    this.el = $("#playhead");
    var actualPlayHeadPos = this.playHeadPos + this.scope.hPadding;
    $("#playhead").attr({x1: actualPlayHeadPos,
                         y1:0,
                         x2:actualPlayHeadPos,
                         y2: this.height});
  },

  move: function(amount) {
    this.playHeadPos = this.playHeadPos + amount;

    if(this.playHeadPos < 0) {
      // loop back to end
      this.playHeadPos = this.width - (this.scope.hPadding*2);
    } else if(this.playHeadPos > (this.width-(this.scope.hPadding*2))) {
      this.playHeadPos = 0;
    }

    this.render();
  },
};

