const moment = require('moment'),
			ObjectId = require('mongodb').ObjectId;

module.exports = (app, db) => {

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

	app.route('/deleteEvent/:room/:id').delete((req, res) => {
		console.log(req.params.id);
		db
			.collection('event')
			.findOneAndDelete({ _id: ObjectId(req.params.id) })
			.then(() => {
				db
					.collection('event')
					.find({
						Date: { $gte: moment().format('YYYY-MM-DD') },
						Room: req.params.room
					})
					.sort({ SortField: 1 })
					.toArray((err, data) => {
						if (err) throw err;
						data.forEach(e => {
							e.Date = moment(e.Date).format('ddd, MMM DD YYYY');
						});
						res.json(data);
					});
			});
	});

	app.route('/editEvents/:room').get((req, res) => {
		db
			.collection('event')
			.find({
				Date: { $gte: moment().format('YYYY-MM-DD') },
				Room: req.params.room
			})
			.sort({ SortField: 1 })
			.toArray((err, data) => {
				if (err) throw err;
				data.forEach(e => {
					e.Date = moment(e.Date).format('ddd, MMM DD YYYY');
				});
				res.render('editMeetings', {
					data,
					Title: `Conference Room ${req.params.room}`,
					url: req.params.room.toLowerCase()
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
		res.render('meetingEntry.hbs', {
			title: `Conference Room ${req.params.room}`,
			url: req.params.room.toLowerCase()
		});
	});

	app.route('/roomDisplay/:room').get((req, res) => {
		res.render('display.hbs', {
			title: `Conference Room ${req.params.room}`,
			url: req.params.room.toLowerCase()
		});
	});

	app.route('/updateEvent/:room/:id').put((req, res) => {
		let obj = {};
		let date = moment(req.body.meetingDate).format('YYYY-MM-DD');
		let startTime = `${req.body.startTime} ${req.body.startTimePeriod}`;

		obj['Title'] = req.body.meetingTitle;
		obj['Start Time'] = startTime;
		obj['End Time'] = `${req.body.endTime} ${req.body.endTimePeriod}`;
		obj['Date'] = date;
		obj['Room'] = req.params.room;
		obj['SortField'] = moment(
			`${date} ${startTime}`,
			'YYYY-MM-DD h:mm a'
		).valueOf();
		console.log(obj);
		db
			.collection('event')
			.findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $set: obj })
			.then(() => {
				db
					.collection('event')
					.find({
						Date: { $gte: moment().format('YYYY-MM-DD') },
						Room: req.params.room
					})
					.sort({ SortField: 1 })
					.toArray((err, data) => {
						if (err) throw err;
						data.forEach(e => {
							e.Date = moment(e.Date).format('ddd, MMM DD YYYY');
						});
						res.json(data);
					});
			});
	});
};
