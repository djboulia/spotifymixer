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

const DC101 = {
  stationId: 'wwdc-fm',
  playListId: '356fqj69ugsvFTBgRGK9Xr',
};

const Rock98 = {
  stationId: 'wxtb-fm',
  playListId: '7nyvjPt084p4cY7BPucDiF',
};

const U1009 = {
  stationId: 'wiba-hd2',
  playListId: '6ZPhEMCM684QeeHb86BXr1',
};

const BIG957 = {
  stationId: 'writ-fm',
  playListId: '5lcRbHcmQBqskUgv0OxFW4',
};

const Majic105 = {
  stationId: 'wmji-fm',
  playListId: '3HV1ocKu6cYKaOEOn8kihh',
};

export default function RadioSync() {
  const [wdgcResults, setWDCGResults] = useState([]);
  const [wrduResults, setWRDUResults] = useState([]);
  const [wmagResults, setWMAGResults] = useState([]);
  const [wncbResults, setWNCBResults] = useState([]);
  const [dc101Results, setDC101Results] = useState([]);
  const [rock98Results, setRock98Results] = useState([]);
  const [u1009Results, setU1009Results] = useState([]);
  const [big957Results, setBIG957Results] = useState([]);
  const [majic105Results, setMajic105Results] = useState([]);

  const classes = useStyles();

  const syncStation = (station, setResults) => {
    const stationId = station.stationId;
    const playListId = station.playListId;

    setResults(undefined);

    SpotifyApi.radioSync(stationId, playListId)
      .then((results) => {
        console.log('Sync results: ', results);
        setResults(results);
      })
      .catch((error) => {
        console.error('Error syncing radio station:', error);
        setResults([]);
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
              syncStation(WDCG, setWDCGResults);
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
              syncStation(WRDU, setWRDUResults);
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
              syncStation(WMAG, setWMAGResults);
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
              syncStation(WNCB, setWNCBResults);
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
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncStation(DC101, setDC101Results);
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            DC101 (Rock)
          </Button>
          <div>
            <TrackResults results={dc101Results} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncStation(Rock98, setRock98Results);
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            98 Rock (Rock)
          </Button>
          <div>
            <TrackResults results={rock98Results} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncStation(U1009, setU1009Results);
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            U1009 (60s and 70s)
          </Button>
          <div>
            <TrackResults results={u1009Results} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncStation(BIG957, setBIG957Results);
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            BIG 95.7 (80s and 90s)
          </Button>
          <div>
            <TrackResults results={big957Results} />
          </div>
        </div>
        <div className={classes.header}>
          <Button
            onClick={() => {
              syncStation(Majic105, setMajic105Results);
            }}
            className={classes.buttons}
            variant="contained"
            color="primary"
          >
            Majic 105.7 (70s and 80s)
          </Button>
          <div>
            <TrackResults results={majic105Results} />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
