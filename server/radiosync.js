/**
 *
 * Take a radio station from iheart radio and sync it with a Spotify playlist
 *
 * @param {Object} spotifyApi initialized Spotify module to use for API calls
 */
const PlayList = require('./playlist');
const TrackSearch = require('./tracksearch');

const RadioSync = function (spotifyApi) {
  const NUM_TRACKS = 250;

  // look in the station track list for title and artist
  const inStationList = (title, artist, tracks) => {
    return tracks.some((track) => track.title === title && track.artist.artistName === artist);
  };

  const fetchRecentlyPlayed = async (stationId, numTracks) => {
    const response = await fetch(
      `https://webapi.radioedit.iheart.com/graphql?operationName=GetCurrentlyPlayingSongs&variables=%7B%22slug%22%3A%22${stationId}%22%2C%22paging%22%3A%7B%22take%22%3A${numTracks}%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22386763c17145056713327cddec890cd9d4fea7558efc56d09b7cd4167eef6060%22%7D%7D`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recently played tracks');
    }

    const data = await response.json();
    const tracks = data?.data?.sites?.find?.stream?.amp?.currentlyPlaying?.tracks || [];

    // remove any duplicate tracks
    const uniqueTracks = [];
    tracks.forEach((track) => {
      if (!inStationList(track.title, track.artist.artistName, uniqueTracks)) {
        uniqueTracks.push(track);
      }
    });

    return uniqueTracks;
  };

  const inPlayList = (title, artist, tracks) => {
    return tracks.some((track) => track.name === title && track.artists.includes(artist));
  };

  /**
   * search spotify for radio station tracks
   *
   * @param {Array} stationTracks - radio station tracks
   * @returns an array of spotify track objects
   */
  const searchSpotifyTracks = async (stationTracks) => {
    // search for new tracks in spotify
    const trackSearch = new TrackSearch(spotifyApi);
    const searchPromises = [];
    for (const track of stationTracks) {
      searchPromises.push(trackSearch.findTrack(track.title, track.artist.artistName));
    }

    // wait for all search promises to resolve
    const searchResults = await Promise.all(searchPromises);
    return searchResults;
  };

  /**
   * compare the spotify playlist tracks to the station tracks and only keep
   * the ones that are not already in the playlist
   *
   * @param {Array} tracks - spotify playlist tracks
   * @param {Array} stationTracks - radio station tracks
   * @returns {Array} - unique station tracks not in the playlist
   */
  const getUniqueStationTracks = (tracks, stationTracks) => {
    const uniqueTracks = [];

    stationTracks.forEach((stationTrack) => {
      if (!inPlayList(stationTrack.title, stationTrack.artist.artistName, tracks)) {
        // console.log(
        //   `Station track not in playlist: ${stationTrack.title} by ${stationTrack.artist.artistName}`,
        // );
        uniqueTracks.push(stationTrack);
      }
    });

    return uniqueTracks;
  };

  /**
   * there is a chance the artist/title didn't match exactly between iheartradio and spotify,
   * so we look up each track in the original potify playlist to avoid duplicates
   *
   * @param {Array} tracks - spotify playlist tracks
   * @param {Array} searchResults - spotify search results tracks
   * @returns an array of unique spotify tracks to add to the playlist
   */
  const getUniqueSpotifyTracks = (tracks, searchResults) => {
    const uniqueTracks = [];

    for (const searchTrack of searchResults) {
      if (!searchTrack) {
        console.log(`No track found`);
        continue;
      }

      // there is a chance the artist/title didn't match exactly between iheartradio and spotify,
      // so we look up each track in the spotify playlist to see if the same track is already there
      if (!inPlayList(searchTrack.name, searchTrack.artists[0].name, tracks)) {
        console.log('Unique track:', searchTrack.name + ' by ' + searchTrack.artists[0].name);
        uniqueTracks.push(searchTrack);
      }
    }

    return uniqueTracks;
  };

  /**
   * compare the station tracks to the playlist tracks and only keep
   * the ones that are not already in the playlist
   *
   * @param {Array} tracks - spotify titles/artists
   * @param {Array} stationTracks
   * @returns an array of spotify track URIs to add to the playlist
   */
  const findNewTracks = async (playlistTracks, stationTracks) => {
    // build a list of the title and artists for each track in the playlist
    const tracks = playlistTracks.tracks.map((track) => {
      const artistNames = track.track.artists.map((artist) => artist.name);
      return {
        name: track.track.name,
        artists: artistNames,
      };
    });
    // console.log('tracks ', tracks);

    const uniqueStationTracks = getUniqueStationTracks(tracks, stationTracks);

    const searchResults = await searchSpotifyTracks(uniqueStationTracks);

    // double check that the search results are unique and not already in the playlist
    const uniqueSpotifyTracks = getUniqueSpotifyTracks(tracks, searchResults);
    return uniqueSpotifyTracks;
  };

  this.sync = async (stationId, playListId) => {
    const playList = new PlayList(spotifyApi);
    const playlistTracks = await playList.getTracks(playListId);
    const stationTracks = await fetchRecentlyPlayed(stationId, NUM_TRACKS);
    console.log(`found ${stationTracks.length} stationTracks `);

    const newTracks = await findNewTracks(playlistTracks, stationTracks);

    if (newTracks.length === 0) {
      console.log('No new tracks to add');
      return [];
    }

    // convert the tracks to spotify URIs for adding to the playlist
    const trackUris = newTracks.map((track) => `spotify:track:${track.id}`);
    console.log('Adding ' + trackUris.length + ' new tracks to playlist ' + playListId);
    await playList.addTracks(playListId, trackUris);

    // show what we added
    return newTracks;
  };
};

module.exports = RadioSync;
