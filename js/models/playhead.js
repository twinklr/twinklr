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

    console.log("Moving, with a width of", this.width);

    if(this.playHeadPos < 0) {
      // loop back to end
      this.playHeadPos = this.width - (this.scope.hPadding*2);
    } else if(this.playHeadPos > (this.width-(this.scope.hPadding*2))) {
      this.playHeadPos = 0;
    }

    this.render();
    app.dispatcher.trigger('playheadMoved', this.playHeadPos);
  },
  updateWidth: function(offsetWidth) {
    // if we drag beyond the maximum length of the stave,
    // set width to maximum length of Stave
    if(offsetWidth > this.scope.width - this.scope.hPadding) {
      offsetWidth = this.scope.width - this.scope.hPadding;
    }

    // if we drag less than 250, set width to 250;
    if(offsetWidth < (this.scope.hPadding + 250)) {
      offsetWidth = 250 + this.scope.hPadding;
    }

    // now add the padding back on, because the width of the playhead
    // is (perhaps foolishly) the screen width
    this.width = offsetWidth + (this.scope.hPadding);

    if(this.playHeadPos > (this.width - (2*this.scope.hPadding))) {
      this.playHeadPos = this.width - (2*this.scope.hPadding);
    }

    this.render();
  }
};

