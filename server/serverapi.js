/**
 *
 * Encapsulate all of our backend server API calls
 *
 */

const PlayList = require('./playlist');
const ShuffleState = require('./shufflestate');
const SpotifySession = require('./spotifysession');
const RadioSync = require('./radiosync');

var ServerApi = function (server) {
  // hold our shuffle state for each session
  const shuffleState = new ShuffleState();

  // handlers for our backend API entry points
  async function spotifyMe(spotifyApi) {
    const data = await spotifyApi.getMe();

    console.log('Found user ' + data.body.display_name);

    return data.body;
  }

  async function spotifyPlaylists(spotifyApi) {
    const playList = new PlayList(spotifyApi);

    const items = await playList.getOwnedPlayLists();

    // go through the play list and extract what we want
    console.log('playlists: ');
    const list = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // console.log("tracks: ", item.tracks);
      // console.log("images: ", item.images);
      console.log(item.name);

      list.push({
        id: item.id,
        name: item.name,
        img: item.images?.length > 0 ? item.images[0].url : '',
        total: item.tracks.total,
      });
    }

    return list;
  }

  async function spotifyProgress(spotifyApi, context) {
    const session = context.session;
    let shuffleProgress = shuffleState.get(session);

    if (!shuffleProgress) {
      console.log('No shuffle in progress, creating new shuffle state');

      shuffleProgress = shuffleState.add(session);
    }

    return shuffleProgress.status();
  }

  // sync the tracks from an iheartradio station to a spotify playlist
  // tracks already in the playlist will be skipped
  async function spotifyRadioSync(spotifyApi, context) {
    const query = context.query;

    const stationId = query.stationId || null;
    const playListId = query.playListId || null;
    const numTracks = query.numTracks ? parseInt(query.numTracks) : undefined;

    const radioSync = new RadioSync(spotifyApi);
    const results = await radioSync.sync(stationId, playListId, numTracks);

    return results;
  }

  async function spotifyShuffle(spotifyApi, context) {
    const session = context.session;
    const query = context.query;

    const playListId = query.playListId || null;

    const shuffleProgress = shuffleState.add(session);

    shuffleProgress.start();

    // kick off a shuffle... this could take a while, so we
    // return immediately and the caller can check the state
    // via the /progress api
    shuffleProgress.shufflePlayList(spotifyApi, playListId).then(
      function () {
        shuffleProgress.complete();
      },
      function (err) {
        console.log('Error: ', err);
        shuffleProgress.complete();
      },
    );

    return shuffleProgress.status();
  }

  async function spotifyShuffleItems(spotifyApi, shuffleProgress, items) {
    const length = items.length;
    for (let i = 0; i < length; i++) {
      const playListId = items[i];

      // restart progress for each playlist
      shuffleProgress.start();
      shuffleProgress.setMultiple(i + 1, length);

      await shuffleProgress.shufflePlayList(spotifyApi, playListId);
    }

    // we are only complete when all playlists are done
    shuffleProgress.complete();
  }

  async function spotifyShuffleMultiple(spotifyApi, context) {
    const session = context.session;
    const query = context.query;

    const playListString = query.playLists;
    const playLists = playListString ? playListString.split(',') : [];

    console.log('playLists: ', playLists);

    const shuffleProgress = shuffleState.add(session);

    // kick off a shuffle of ALL playlists... this will take a while, so we
    // return immediately and the caller can check the state
    // via the /progress api
    spotifyShuffleItems(spotifyApi, shuffleProgress, playLists);

    return shuffleProgress.status();
  }

  this.init = function (serverConfig, spotifyConfig) {
    const spotifySession = new SpotifySession(server, serverConfig, spotifyConfig);
    spotifySession.init();

    // register each entry that required acccess to the spotify api
    spotifySession.addApi('/api/spotify/me', spotifyMe);
    spotifySession.addApi('/api/spotify/playlists', spotifyPlaylists);
    spotifySession.addApi('/api/spotify/progress', spotifyProgress);
    spotifySession.addApi('/api/spotify/radioSync', spotifyRadioSync);
    spotifySession.addApi('/api/spotify/shuffle', spotifyShuffle);
    spotifySession.addApi('/api/spotify/shuffleMultiple', spotifyShuffleMultiple);
  };
};

module.exports = ServerApi;
