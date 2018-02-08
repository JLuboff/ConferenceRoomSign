const express = require('express'),
      routes = require('./routes/routes'),
      MongoClient = require('mongodb').MongoClient,
      bodyParser = require('body-parser'),
      hbs = require('hbs'),
      port = process.env.PORT || 3000;

var app = express();

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public/images'));
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(`mongodb://localhost:27017`, (err, client) => {
	if (err) throw err;
	var db = client.db('events');

	routes(app, db);
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
