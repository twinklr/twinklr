$(document).ready(function() {
  $("#ui .buttons a").click(function() {
    var id = $(this).attr('id');
    app.editMode = id;

    dimNotes();

    $("#ui-details .inner").html($('#template-'+id).html());

    $("#scale-root").val(app.soundBox.scaleRoot);
    $("#scale-type").val(app.soundBox.scaleType);

    $("#ui-details").css('bottom', -100);
    $("#ui-details").show();

    $("#ui-details").animate({bottom: 0});

    if(id == 'save-load') {
      $.get("/slots", function(data) {
        $(".load-button").each(function(i) {
          var slot = $(this)[0].dataset.slot
          if(data.indexOf(parseInt(slot)) > -1) {
            $(this).removeClass('disabled');
          }
        });
      });
    }

    return false;
  });


  $("#ui").on('click', '.hide-ui',function() {
    unDimNotes();
    app.editMode = null;
    $("#ui-details").animate({bottom: -100}, function() {
      $("#ui-details").hide();
      $("#ui-details .inner").html('');
    });

    app.dispatcher.trigger('tidyNotes');
    return false;
  });

  $("#ui").on('change', '#scale-root', function() {
    app.soundBox.updateScaleRoot($(this).val());
  });

  $("#ui").on('change', '#scale-type', function() {
    app.soundBox.updateScaleType($(this).val());
    app.noteViewManager.recolourNotes();
  });


  $("#ui").on('click', '.save-button', function() {
    var slot = $(this)[0].dataset.slot

    saveTuneInto(slot);

    $(".hide-ui").click();
    return false;
  });

  $("#ui").on('click', '.load-button', function() {
    var slot = $(this)[0].dataset.slot;

    loadTuneFrom(slot);
    return false;
  });

  function dimNotes() {
    $("circle").each(function(i) {
      Snap(this).animate({opacity: 0.3}, 150);
      Snap(this).addClass('dim');
    });
    app.dim = true;
  }

  function unDimNotes() {
    $("circle").each(function(i) {
      Snap(this).animate({opacity: 1.0}, 150);
      Snap(this).removeClass('dim');
    });
    app.dim = false;
  }

  function saveTuneInto(slot) {
    var data = {};
    data.notes = [];

    window.tune.each(function(note) {
      data.notes.push({x: note.get('x'),
                      y: note.get('y'),
                      index: note.get('index')});
    });

    data.scaleType = app.soundBox.scaleType;
    data.scaleRoot = app.soundBox.scaleRoot;
    data.staveWidth = window.stave.staveWidth;

    $.post('/save/'+slot, {data: data});
  }

  function loadTuneFrom(slot) {
    $.get('/load/'+slot, function(data) {
      var newTune = data.data;

      console.log(newTune);

      // delete all notes
      _.each(app.noteViewManager.noteViews, function(nv) {
        app.noteViewManager.deleteNoteView(nv.model.cid);
      });

      window.tune.reset();
      // set scale
      app.soundBox.updateScale(newTune.scaleRoot, newTune.scaleType);
      // set Width
      window.stave.updateWidthFromData(parseInt(newTune.staveWidth));
      window.playhead.updateWidthFromData(parseInt(newTune.staveWidth));
      // for each note

      console.log(newTune);
      // draw a note
      _.each(newTune.notes, function(note) {
        console.log("addingNote", note.x, note.y, note.index);
        window.tune.addNote(parseInt(note.x),parseInt(note.y),parseInt(note.index));
      });
      $(".hide-ui").click();
    });
  }
});

