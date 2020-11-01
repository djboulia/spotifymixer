import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Title from './Title';
import { LinearProgress } from '@material-ui/core';
import SpotifyApi from './SpotifyApi';

// Generate Playlist Data

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Playlists() {
  const classes = useStyles();
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const [name, setName] = React.useState("");
  const [playlist, setPlaylist] = React.useState([]);
  const [inProgress, setInProgress] = React.useState(false);
  const [inProgressName, setInProgressName] = React.useState("Play List");
  const [percentComplete, setPercentComplete] = React.useState(0);

  // set a timer to monitor progress
  const checkProgress = async () => {

    try {
      const result = await SpotifyApi.progress();
      console.log("progress; ", result);

      if (result.inProgress) {
        // update status
        setInProgress(true);
        if (result.shuffled === 0 || result.total === 0) {
          setPercentComplete(0);
        } else {
          setPercentComplete(result.shuffled/result.total * 100);
        }

        // set another time out
        setTimeout(() => {
          console.log('In Timeout');
          checkProgress();
        }, 1000);                
      } else {
        setInProgress(false);
        clearTimeout();
      }
    
    } catch (error) {
      console.log("error checking progress!");
      setErrMsg("error checking progress!");
    }
  };

  const startProgressTimer = function() {
    setTimeout(() => {
      console.log('In Timeout');
      checkProgress();
    }, 1000);
  };

  const shuffle = function(playListId, name) {
    console.log("id :" + playListId);

    SpotifyApi.shuffle(playListId);

    setInProgress(true);
    setPercentComplete(0);
    setInProgressName(name);

    startProgressTimer();
  }

  React.useEffect(() => {
    const fetchData = async () => {
      setHasLoaded(false);
      setErrMsg("");
 
      try {
        const me = await SpotifyApi.me();
        const playlists = await SpotifyApi.getPlayLists();
        const progress = await SpotifyApi.progress();
 
        setName(me.display_name);
        setPlaylist(playlists);
        setHasLoaded(true);
        
        // each time we load the page, 
        // check to see if a previous shuffle is still in progress
        if (progress.inProgress) {
          setInProgress(true);
          startProgressTimer();
        }
      } catch (error) {
        console.log("error loading user data");
        setErrMsg("Error loading user data");
      }
    };
 
    fetchData();
  }, []);

  if (errMsg != "") {
    console.log("Errmsg: " + errMsg);
    return <Alert severity="error">{errMsg}</Alert>
  }

  if (!hasLoaded) {
    return <LinearProgress></LinearProgress>
  }

  const progressIndicator = (
    <div style={{position: "fixed", width: "75%"}}>
      <Alert severity="info">Shuffling {inProgressName}</Alert>
      <LinearProgress variant="determinate" value={percentComplete}></LinearProgress>
   </div>
  );

  return (  
      <React.Fragment>
        {inProgress && progressIndicator}

        <Title>Playlists for {name}</Title>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell></TableCell>
                <TableCell>Playlist</TableCell>
                <TableCell align="right">Songs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playlist.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><Button onClick={() => { shuffle(row.id, row.name) }} disabled={inProgress} variant="contained" color="primary">Shuffle</Button></TableCell>
                  <TableCell><img width="40" src={row.img}></img></TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </React.Fragment>  
  );
}