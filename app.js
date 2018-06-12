const express = require('express');
const routes = require('./routes/routes');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
/* eslint-disable */
const hbs = require('hbs');
/* eslint-enable */
const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'hbs');
app.use(express.static(`${__dirname}/public/images`));
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if (err) throw err;
  const db = client.db('events');

  routes(app, db);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
