import React, { useContext } from 'react'
import { Grid, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { SocketContext } from '../SocketContext';

const useStyles = makeStyles((theme) => ({
    video: {
      width: '550px',
      [theme.breakpoints.down('xs')]: {
        width: '300px',
      },
    },
    gridContainer: {
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
      },
    },
    paper: {
      padding: '10px',
      border: '2px solid black',
      margin: '10px',
    },
  }));

export const VideoPlayer = () => {
    const { name, callAccepted, videoEl, userVideoEl, callEnded, stream, call } = useContext(SocketContext);
    const classes = useStyles();

    return (
        <Grid container className={classes.gridContainer}>
            {/* Current user video */}
            {
                stream && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>{ name || 'Name' }</Typography>
                            <video playsInline muted ref={videoEl} autoPlay className={classes.video}/>
                        </Grid>
                    </Paper>
                )
            }

            {/* Target user video */}
            {
                callAccepted && !callEnded (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>{ call.name || 'Name' }</Typography>
                            <video playsInline ref={userVideoEl} autoPlay className={classes.video}/>
                        </Grid>
                    </Paper>
                )
            }            
        </Grid>
    )
}

export default VideoPlayer;