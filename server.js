var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var _ = require('underscore');

/*
 * TOP-LEVEL VARIABLES
 */

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*
 * EXPRESS CONFIG
 */

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));

/*
 * ROUTING
 */

app.get('/movement/right', function(req,res) {
  io.emit('movement', 1);
});

app.get('/movement/left', function(req,res) {
  io.emit('movement', -1);
});

app.get('/load/:slot', function (req, res) {
  var slot = req.params.slot;

  var fileName = 'data/' + slot + '.json'

  jsonfile.readFile(fileName, function(err, obj) {
    if(err) {
    } else {
      res.json(obj);
    }
  })

});

app.post('/save/:slot', function (req, res) {
  var slot = req.params.slot;
  var data = req.body;
  console.log(slot, req.body);

  var file = 'data/' + slot + '.json'

  jsonfile.writeFile(file, data, function (err) {
    console.error(err)
  })
});

app.get('/slots', function (req,res) {
  fs.readdir('data', function(err, files) {
    var results = _.filter(files, function(f) {
      return f.match(".json");
    }).map(function(f) {
      return parseInt(f.replace(".json", ""));
    });
    res.json(results);
  });
});


/*
 * ...AND FINALLY
 */

io.on('connection', function(socket){
  console.log('client connected');
});

http.listen(app.get('port'), function(){
  console.log('Twinklr is running on port', app.get('port'));
});
