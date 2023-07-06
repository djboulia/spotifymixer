import React from 'react';
import { Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { LinearProgress } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Alert from '@material-ui/lab/Alert';
import Title from './Title';
import Dashboard from './Dashboard';
import SpotifyApi from './SpotifyApi';
import ProgressModal from './PlaylistProgressModal';

// Generate Playlist Data

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  shuffleSelected: {
    width: 250,
    marginBottom: 20,
    marginRight: 10,
  },
}));

export default function Playlists() {
  const classes = useStyles();
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState('');
  const [name, setName] = React.useState('');
  const [playlist, setPlaylist] = React.useState([]);
  const [inProgress, setInProgress] = React.useState(false);
  const [playListDetails, setPlayListDetails] = React.useState({ name: 'Play List', img: '' });
  const [multipleStatus, setMultipleStatus] = React.useState(undefined);
  const [percentComplete, setPercentComplete] = React.useState(0);
  const [artists, setArtists] = React.useState([]);

  // set a timer to monitor progress
  const checkProgress = async () => {
    try {
      const result = await SpotifyApi.progress();
      console.log('progress; ', result);

      if (result.inProgress) {
        // update status
        setInProgress(true);
        if (result.shuffled === 0 || result.total === 0) {
          setPercentComplete(0);
        } else {
          setPercentComplete((result.shuffled / result.total) * 100);
        }

        // update play list name
        if (result.playList) {
          setPlayListDetails(result.playList);
        }

        if (result.multiple) {
          setMultipleStatus(result.multiple);
        }

        setArtists(result.artists);

        // still in proogress, so set another time out to check again
        setTimeout(() => {
          console.log('In Timeout');
          checkProgress();
        }, 1000);
      } else {
        // reset the checkboxes for the playlist
        for (let i = 0; i < playlist.length; i++) {
          playlist[i].checked = false;
        }

        // complete - stop in progress indicator and clear timeout
        setInProgress(false);

        clearTimeout();
      }
    } catch (error) {
      console.log('error checking progress!');
      setErrMsg('Error communicating with server!');
    }
  };

  const startProgressTimer = function () {
    setTimeout(() => {
      console.log('In Timeout');
      checkProgress();
    }, 1000);
  };

  const shuffleMultiple = function () {
    const playLists = [];
    for (let i = 0; i < playlist.length; i++) {
      if (playlist[i].checked) {
        playLists.push(playlist[i].id);
      }
    }

    SpotifyApi.shuffleMultiple(playLists);

    setInProgress(true);
    setPercentComplete(0);
    setPlayListDetails({ name: 'Play List', img: '' });
    setMultipleStatus(undefined);
    setArtists([]);

    startProgressTimer();
  };

  const nothingSelected = function () {
    console.log('nothingSelected called');
    for (let i = 0; i < playlist.length; i++) {
      if (playlist[i].checked) {
        return false;
      }
    }
    return true;
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setHasLoaded(false);
      setErrMsg('');

      try {
        const me = await SpotifyApi.me();
        const playlists = await SpotifyApi.getPlayLists();
        const progress = await SpotifyApi.progress();

        for (let i = 0; i < playlists.length; i++) {
          playlists[i].checked = false;
        }

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
        console.log('error loading user data');
        setErrMsg('Error loading user data!');
      }
    };

    fetchData();
  }, []);

  if (errMsg != '') {
    console.log('Errmsg: ' + errMsg);

    const page = '/logout';
    console.log('Redirecting to : ' + page);
    return (
      <div>
        <Alert severity="error">{errMsg}</Alert>
        <Redirect to={page} />
      </div>
    );
  }

  if (!hasLoaded) {
    return <LinearProgress></LinearProgress>;
  }

  const progressIndicator = (
    <ProgressModal
      playlist={playListDetails}
      multipleStatus={multipleStatus}
      percentComplete={percentComplete}
      artists={artists}
    />
  );

  return (
    <Dashboard>
      {inProgress && progressIndicator}

      <Title>Playlists for {name}</Title>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={() => {
            shuffleMultiple();
          }}
          className={classes.shuffleSelected}
          disabled={inProgress || nothingSelected()}
          variant="contained"
          color="primary"
        >
          Shuffle Selected
        </Button>
      </div>

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
              <TableCell>
                <Checkbox
                  onChange={() => {
                    row.checked = !row.checked;
                    console.log('checked: ' + row.checked);
                    setPlaylist([...playlist]);
                  }}
                  disabled={inProgress}
                  variant="contained"
                  color="primary"
                  checked={row.checked}
                ></Checkbox>
              </TableCell>
              <TableCell>
                <img width="40" src={row.img}></img>
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Dashboard>
  );
}
