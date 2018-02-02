const express = require('express'),
      routes = require('./routes/routes'),
      MongoClient = require('mongodb').MongoClient,
      bodyParser = require('body-parser'),
      port = process.env.PORT || 3000;

var app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(`mongodb://localhost:27017`, (err, client)=>{
  if(err) throw err;
  var db = client.db('events');

  routes(app, db);
})

app.listen(port, ()=>{
  console.log(`Listening on port ${port}`);
})
