var express = require('express'),
    exphbs = require('express-handlebars'),
    _ = require('underscore'),
    midi = require('midi');

var app = express(), handlebars;
var logger = require('./logger');

if(process.env.NODE_ENV == 'production') {
  logger.debugLevel = 'info';
} else {
  logger.debugLevel = 'debug';
}

var midiOutput = new midi.output();
midiOutput.openVirtualPort("Twinklr Midi Out");
logger.log('debug','Opening MIDI port');

process.on('exit', function() {
  midiOutput.closePort();
  logger.log('debug','Closing MIDI port');
});

// Create `ExpressHandlebars` instance with a default layout.
handlebars = exphbs.create({
    extname      : '.html', //set extension to .html so handlebars knows what to look for
});

// Register `hbs` as our view engine using its bound `engine()` function.
// Set html in app.engine and app.set so express knows what extension to look for.
app.engine('html', handlebars.engine);
app.set('view engine', 'html');
// use /public for static files
app.use(express.static(__dirname + '/public'));

// port should either be 5000 or set in environment variables
app.set('port', (process.env.PORT || 5000))

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.render('musicbox')
});

function scaleNote(index) {
  // 0 is middle c;
  var notes = [60,62,64,65,67,69,71,72];
  return notes[index];
}

io.on('connection', function(socket){
  socket.on('note', function(data) {
    var note = scaleNote(data);
    logger.log('debug','playing '+note);
    midiOutput.sendMessage([144,note,100]);

    setTimeout(function() {
      // stop note a second later
      logger.log('debug','stopping '+note);
      midiOutput.sendMessage([128,note,100]);
    }, 1000);
  });
});

// finally, spin the app up
http.listen(app.get('port'), function(){
  logger.log('info', 'listening on *:' + app.get('port'));
});
