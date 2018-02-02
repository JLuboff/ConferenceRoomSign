
module.exports = (app, db) => {
  app.route('/createEvents').post((req, res) => {
    console.log("Post route reached");
    console.log(req.body);
    let insert = [];

    for(let i = 0; i < req.body.meetingTitle.length; i++){
      let obj = {};

      obj["Title"] = req.body.meetingTitle[i];
      obj['Start Time'] = `${req.body.startTime[i]} ${req.body.startTimePeriod[i]}`;
      obj['End Time'] = `${req.body.endTime[i]} ${req.body.endTimePeriod[i]}`;
      insert.push(obj);
    }
    console.log(insert);

    db.collection('event').insertMany(insert);
    db.collection('event').find({}).toArray((err, doc) => {
      if(err) throw err;
      console.log(doc);
    })
  })
}
