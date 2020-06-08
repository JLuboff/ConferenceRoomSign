const moment = require('moment');
const { ObjectId } = require('mongodb');

module.exports = (app, db) => {
  function transform(
    meetingDate,
    meetingTitle,
    startTime,
    startTimePeriod,
    endTime,
    endTimePeriod,
    room,
  ) {
    const obj = {};
    const startTimeFull = `${startTime} ${startTimePeriod}`;
    const SortField = moment(`${meetingDate} ${startTimeFull}`, 'YYYY-MM-DD h:mm a').valueOf();
    const endTimeFull = `${endTime} ${endTimePeriod}`;
    const SortEndTime = moment(`${meetingDate} ${endTimeFull}`, 'YYYY-MM-DD h:mm a').valueOf();

    obj.Title = meetingTitle;
    obj['Start Time'] = startTimeFull;
    obj['End Time'] = endTimeFull;
    obj.Date = meetingDate;
    obj.Room = room;
    obj.SortField = SortField;
    obj.SortEndTime = SortEndTime;

    return obj;
  }

  async function exists(item) {
    /* eslint-disable */
    const result = await db.collection('event')
      .find({
        Date: item.Date,
        Room: item.Room,
        $or: [{ $or: [{ SortField: { $lte: item.SortField }, SortEndTime: { $gt: item.SortField } }] },
            { $or: [{ SortField: { $lt: item.SortEndTime }, SortEndTime: { $gte: item.SortEndTime } }]
          }]})
      .toArray();
    /* eslint-enable */
    return !!result.length;
  }

  app.route('/confSelect').get((req, res) => {
    res.render('confSelect.hbs');
  });

  app.route('/createEvents/:room').post(async (req, res) => {
    try {
      const items = req.body.meetingTitle.map((meetingTitle, i) =>
        transform(
          req.body.meetingDate[i],
          meetingTitle,
          req.body.startTime[i],
          req.body.startTimePeriod[i],
          req.body.endTime[i],
          req.body.endTimePeriod[i],
          req.params.room,
        ));

      const itemsExist = await Promise.all(items.map(exists));
      const someExist = itemsExist.some(item => item);

      if (someExist) {
        return res.sendStatus(400);
      }

      await db.collection('event').insertMany(items);
      return res.sendStatus(200);
    } catch (e) {
      console.error(e);
      return res.sendStatus(500);
    }
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
    const endTime = `${req.body.endTime} ${req.body.endTimePeriod}`;

    obj.Title = req.body.meetingTitle;
    obj['Start Time'] = startTime;
    obj['End Time'] = endTime;
    obj.Date = date;
    obj.Room = req.params.room;
    obj.SortField = moment(
      `${date} ${startTime}`,
      'YYYY-MM-DD h:mm a',
    ).valueOf();
    obj.SortEndTime = moment(
      `${date} ${endTime}`,
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
