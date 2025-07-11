import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Title from './Title';
import Dashboard from './Dashboard';
import SpotifyApi from '../lib/SpotifyApi';

// Generate Playlist Data

const useStyles = makeStyles((theme) => ({
  buttons: {
    width: 250,
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
}));

const WRDU = {
  stationId: 'wrdu-fm',
  playListId: '2KUWvsEq7sAibXZR0xCCJ1',
};

const WDCG = {
  stationId: 'wdcg-fm',
  playListId: '5RcbbAMchnjjo6QSMwn7z4',
};

const WMAG = {
  stationId: 'wmag-fm',
  playListId: '5ugQ31xoBaNmMIRFyyU5AQ',
};

const WNCB = {
  stationId: 'wncb-fm',
  playListId: '5t809aA0Wvd6qrSHj6RUZL',
};

export default function RadioSync() {
  const [wdgcResults, setWDCGResults] = useState([]);
  const [wrduResults, setWRDUResults] = useState([]);
  const [wmagResults, setWMAGResults] = useState([]);
  const [wncbResults, setWNCBResults] = useState([]);

  const classes = useStyles();

  const syncWDCG = function () {
    const stationId = WDCG.stationId;
    const playListId = WDCG.playListId;

    setWDCGResults(undefined);

    SpotifyApi.radioSync(stationId, playListId)
      .then((results) => {
        console.log('Sync results: ', results);
        setWDCGResults(results);
      })
      .catch((error) => {
        console.error('Error syncing radio station:', error);
        setWDCGResults([]);
      });
  };

  const syncWRDU = function () {
    const stationId = WRDU.stationId;
    const playListId = WRDU.playListId;

    setWRDUResults(undefined);

    SpotifyApi.radioSync(stationId, playListId)
      .then((results) => {
        console.log('Sync results: ', results);
        setWRDUResults(results);
      })
      .catch((error) => {
        console.error('Error syncing radio station:', error);
        setWRDUResults([]);
      });
  };

  const syncWMAG = function () {
    const stationId = WMAG.stationId;
    const playListId = WMAG.playListId;

    setWMAGResults(undefined);

    SpotifyApi.radioSync(stationId, playListId)
      .then((results) => {
        console.log('Sync results: ', results);
        setWMAGResults(results);
      })
      .catch((error) => {
        console.error('Error syncing radio station:', error);
        setWMAGResults([]);
      });
  };

  const syncWNCB = function () {
    const stationId = WNCB.stationId;
    const playListId = WNCB.playListId;

    setWNCBResults(undefined);

    SpotifyApi.radioSync(stationId, playListId)
      .then((results) => {
        console.log('Sync results: ', results);
        setWNCBResults(results);
      })
      .catch((error) => {
        console.error('Error syncing radio station:', error);
        setWNCBResults([]);
      });
  };

  const TrackResults = ({ results }) => {
    if (!results) {
      return <div>Loading...</div>;
    }

    if (results.length === 0) {
      return <div>No tracks added.</div>;
    }

    return (
      <div>
        {results.map((track) => (
          <div key={track.id}>
            {track.name} by {track.artists[0].name}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dashboard>
      <Title>Sync Radio Station with Playlist:</Title>
      <div>
        <div className={classes.header}>
          <div></div>
          <div>
            <b>Last sync</b>
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncWDCG();
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            G105 (Top 40)
          </Button>
          <div>
            <TrackResults results={wdgcResults} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncWRDU();
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            WRDU (Classic Rock)
          </Button>
          <div>
            <TrackResults results={wrduResults} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncWMAG();
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            Mix 99.5
          </Button>
          <div>
            <TrackResults results={wmagResults} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncWNCB();
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            B93.9 (New Country)
          </Button>
          <div>
            <TrackResults results={wncbResults} />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
