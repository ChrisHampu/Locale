var express = require('express');
var app = express();

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Locale Webserver launched at http://%s:%s', host, port);

});

app.get('/Test', function (req, res) {
    res.statusCode = 200;
    res.send('200 - All good baby');
});
