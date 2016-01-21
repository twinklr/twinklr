var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');


var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));

app.post('/save/:slot', function (req, res) {
  var slot = req.params.slot;
  var data = req.body;
  console.log(slot, req.body);

  var file = 'data/' + slot + '.json'

  jsonfile.writeFile(file, data, function (err) {
    console.error(err)
  })
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
