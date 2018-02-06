const moment = require('moment');
module.exports = (app, db) => {
	app.route('/meetingEntry/:room').get((req, res) => {
		res.render('meetingEntry.hbs', {
			Title: `Conference Room ${req.params.room}`,
			url: req.params.room.toLowerCase()
		});
	});

	app.route('/createEvents/:room').post((req, res) => {
		let insert = [];

		for (let i = 0; i < req.body.meetingTitle.length; i++) {
			let obj = {};
			let startTime = `${req.body.startTime[i]} ${req.body.startTimePeriod[i]}`;

			obj['Title'] = req.body.meetingTitle[i];
			obj['Start Time'] = startTime;
			obj['End Time'] = `${req.body.endTime[i]} ${req.body.endTimePeriod[i]}`;
			obj['Date'] = req.body.meetingDate[i];
			obj['Room'] = req.params.room;
			obj['SortField'] = moment(
				`${req.body.meetingDate[i]} ${startTime}`,
				'YYYY-MM-DD h:mm a'
			).valueOf();
			insert.push(obj);
		}

		db.collection('event').insertMany(insert);
    res.send('Success');
	});

	app.route('/roomDisplay/:room').get((req, res) => {
		res.render('display.hbs', {
			Title: `Conference Room ${req.params.room}`,
			url: req.params.room.toLowerCase()
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
};
