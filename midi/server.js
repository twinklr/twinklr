var express = require('express'),
    exphbs = require('express-handlebars'),
    fs = require('fs'),
    _ = require('underscore');

var app = express(), handlebars;
var logger = require('./logger');

if(process.env.NODE_ENV == 'production') {
  logger.debugLevel = 'info';
} else {
  logger.debugLevel = 'debug';
}

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

io.on('connection', function(socket){
  socket.on('note', function(data) {
    logger.log('debug','got sent data '+data);
  });
});

// finally, spin the app up
http.listen(app.get('port'), function(){
  logger.log('info', 'listening on *:' + app.get('port'));
});
