const express = require('express'),
      MongoClient = require('mongodb').MongoClient,
      port = process.env.PORT || 3000;

var app = express();

MongoClient.connect(`mongodb://localhost:27017`, (err, client)=>{
  if(err) throw err;
  var db = client.db('events');
console.log(db);
  app.get('/', (req, res) => {
    db.collection('event').insert({'Title': 'Weekend Duty', 'Start Time': '10:00 AM', 'End Time': '11:00 AM'});
    db.collection('event').find({}).toArray((err, doc) => {
      if(err) throw err;
      res.send(doc);
    })
  //  res.send('Success.');
  })
})

app.listen(port, ()=>{
  console.log(`Listening on port ${port}`);
})
