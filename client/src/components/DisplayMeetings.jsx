import React from 'react';
import { makeStyles, createStyles, AppBar, Toolbar, Grid, Typography } from '@material-ui/core';
import moment from 'moment'

const useStyles = makeStyles(() => createStyles({
    header: {
    fontFamily: 'Open Sans, sans-serif',
    backgroundColor: '#205491',
    fontSize: '60px',
    color: '#dce1d8',
    boxShadow: '0px 6px 5px #888888',
    // padding: '5px'
  },
  confStatusBarFree: {
      backgroundColor: '#44af69'
  }
}))
const DisplayMeetings = ({ room }) => {
    const classes = useStyles();
return (
  <>
    <AppBar position="static">
      <Toolbar className={classes.header}>{`Conference Room ${room}`}</Toolbar>
    </AppBar>
    <Grid container direction="row">
      <Grid item xs={2} className={classes.confStatusBarFree} />
      <Grid item>Available</Grid>
    </Grid>
    <AppBar position="static">
      <Toolbar className={classes.header}>
        <Grid container direction="columns">
          <Grid item>{moment().format('dddd, MMMM Do')}</Grid>
        </Grid>
      </Toolbar>
    </AppBar>
    <Grid container direction="row">
        <Grid item>
            <Typography variant="h3">
                No events currently scheduled
            </Typography>
        </Grid>
    </Grid>
  </>
);
}

export default DisplayMeetings;