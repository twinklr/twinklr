var app = app || {};

app.noteViewManager = {
  noteViews: {},

  add: function(noteView) {
    this.noteViews[noteView.model.cid] = noteView;
  },

  deleteNoteView: function(cid) {
    this.noteViews[cid].removeSvg();
    delete this.noteViews[cid];
  }
}
