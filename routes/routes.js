const moment = require('moment');
const { ObjectId } = require('mongodb');

module.exports = (app, db) => {
  app.route('/confSelect').get((req, res) => {
    res.render('confSelect.hbs');
  });

  app.route('/createEvents/:room').post((req, res) => {
    const insert = [];

    for (let i = 0; i < req.body.meetingTitle.length; i += 1) {
      const obj = {};
      const startTime = `${req.body.startTime[i]} ${req.body.startTimePeriod[i]}`;

      obj.Title = req.body.meetingTitle[i];
      obj['Start Time'] = startTime;
      obj['End Time'] = `${req.body.endTime[i]} ${req.body.endTimePeriod[i]}`;
      obj.Date = req.body.meetingDate[i];
      obj.Room = req.params.room;
      obj.SortField = moment(
        `${req.body.meetingDate[i]} ${startTime}`,
        'YYYY-MM-DD h:mm a',
      ).valueOf();
      insert.push(obj);
    }

    db.collection('event').insertMany(insert);
    res.sendStatus(200);
  });

  app.route('/deleteEvent/:room/:id').delete((req, res) => {
    db
      .collection('event')
      .findOneAndDelete({ _id: ObjectId(req.params.id) })
      .then(() => {
        db
          .collection('event')
          .find({
            Date: { $gte: moment().format('YYYY-MM-DD') },
            Room: req.params.room,
          })
          .sort({ SortField: 1 })
          .toArray((err, data) => {
            if (err) throw err;
            data.forEach((e) => {
              e.Date = moment(e.Date).format('ddd, MMM DD YYYY');
              e.longTitle = e.Title.length > 23 ? e.Title : false;
              e.Title =
               e.Title.length > 23 ? `${e.Title.slice(0, 23)}...` : e.Title;
            });
            res.json(data);
          });
      });
  });

  app.route('/editEvents/:room').get((req, res) => {
    const { room } = req.params;
    const title = room.toLowerCase() === 'training room' ? 'Training Room' : `Conference Room ${room}`;

    db
      .collection('event')
      .find({
        Date: { $gte: moment().format('YYYY-MM-DD') },
        Room: room,
      })
      .sort({ SortField: 1 })
      .toArray((err, data) => {
        if (err) throw err;
        data.forEach((e) => {
          e.Date = moment(e.Date).format('ddd, MMM DD YYYY');
          e.longTitle = e.Title.length > 23 ? e.Title : false;
          e.Title =
           e.Title.length > 23 ? `${e.Title.slice(0, 23)}...` : e.Title;
        });
        res.render('editMeetings', {
          data,
          Title: title,
          url: req.params.room.toLowerCase(),
        });
      });
  });

  app.route('/getEvents/:room').get((req, res) => {
    db
      .collection('event')
      .find({ Date: moment().format('YYYY-MM-DD'), Room: req.params.room })
      .sort({ SortField: 1 })
      .toArray((err, docs) => {
        if (err) throw err;
        res.json(docs);
      });
  });

  app.route('/meetingEntry/:room').get((req, res) => {
    const { room } = req.params;
    const title = room.toLowerCase() === 'training room' ? 'Training Room' : `Conference Room ${room}`;
    res.render('meetingEntry.hbs', {
      title,
      url: room.toLowerCase(),
    });
  });

  app.route('/roomDisplay/:room').get((req, res) => {
    const { room } = req.params;
    const title = room.toLowerCase() === 'training room' ? 'Training Room' : `Conference Room ${room}`;
    res.render('display.hbs', {
      title,
      url: req.params.room.toLowerCase(),
    });
  });

  app.route('/updateEvent/:room/:id').put((req, res) => {
    const obj = {};
    const date = moment(req.body.meetingDate).format('YYYY-MM-DD');
    const startTime = `${req.body.startTime} ${req.body.startTimePeriod}`;

    obj.Title = req.body.meetingTitle;
    obj['Start Time'] = startTime;
    obj['End Time'] = `${req.body.endTime} ${req.body.endTimePeriod}`;
    obj.Date = date;
    obj.Room = req.params.room;
    obj.SortField = moment(
      `${date} ${startTime}`,
      'YYYY-MM-DD h:mm a',
    ).valueOf();
    db
      .collection('event')
      .findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $set: obj })
      .then(() => {
        db
          .collection('event')
          .find({
            Date: { $gte: moment().format('YYYY-MM-DD') },
            Room: req.params.room,
          })
          .sort({ SortField: 1 })
          .toArray((err, data) => {
            if (err) throw err;
            data.forEach((e) => {
              e.Date = moment(e.Date).format('ddd, MMM DD YYYY');
              e.longTitle = e.Title.length > 23 ? e.Title : false;
              e.Title =
               e.Title.length > 23 ? `${e.Title.slice(0, 23)}...` : e.Title;
            });
            res.json(data);
          });
      });
  });
};
