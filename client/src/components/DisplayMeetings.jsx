import React, { useEffect, useState, Fragment } from 'react';
import {
  makeStyles,
  createStyles,
  AppBar,
  Toolbar,
  Grid,
  Typography,
} from '@material-ui/core';
import moment from 'moment';

const useStyles = makeStyles(() =>
  createStyles({
    header: {
      fontFamily: 'Open Sans, sans-serif',
      backgroundColor: '#205491',
      fontSize: '60px',
      color: '#dce1d8',
      boxShadow: '0px 6px 5px #888888',
    },
    statusHeight: {
      height: '500px',
    },
    confStatusBarFree: {
      backgroundColor: '#44af69',
    },
    consStatusBarBusy: {
      backgroundColor: '#de1a1a'
    }
  })
);
const DisplayMeetings = () => {
  const classes = useStyles();
  const [clock, setClock] = useState('');
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState('Available')
  const [statusClass, setStatusClass] = useState(classes.confStatusBarFree)
  const room = 'California';
  setInterval(() => {
    setClock(moment().format('h:mm A'));
  }, 1000);

  useEffect(() => {
    setInterval(async () => {
      const fetchedResult = await fetch(
        `http://localhost:3000/getEvents/${room.toLowerCase()}`,
        { method: 'GET' }
      );
      const content = await fetchedResult;
      const data = await content.json();
      console.log(data);
      setEvents([...data]);
    }, 30000);
  }, []);

  setInterval(() => {
    for (const event of events){
      if (moment().isBetween(moment(event['Start Time']), moment(event['End Time']))){
        setCurrentEvent(event.Title);
        return setStatusClass(classes.confStatusBarFree)
      }

    }
  }, 3000)
  return (
    <>
      <AppBar position="static">
        <Toolbar
          className={classes.header}
        >{`Conference Room ${room}`}</Toolbar>
      </AppBar>
      <Grid
        container
        direction="row"
        justify="center"
        className={classes.statusHeight}
      >
        <Grid item xs={1} className={statusClass} />
        <Grid item xs={11}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
          >
            <Grid item>
  <Typography variant="h1">{currentEvent}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <AppBar position="static">
        <Toolbar className={classes.header}>
          <Grid
            container
            direction="column"
            alignItems="flex-start"
            justify="center"
          >
            <Grid item>
              <Typography variant="h2">{clock}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h3">
                {moment().format('dddd, MMMM Do')}
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {events.length ? (
          events.map(
            ({ Title, 'End Time': endTime, 'Start Time': startTime }) => (
              <Fragment key={`${endTime}${startTime}`}>
                <Grid item xs={8}>
                  <Typography variant="h2" align="left">
                    {Title}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h2" align="left">
                    {startTime}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h2" align="left">
                    {endTime}
                  </Typography>
                </Grid>
              </Fragment>
            )
          )
        ) : (
          <Grid item>
            <Typography variant="h3">No events currently scheduled</Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default DisplayMeetings;
