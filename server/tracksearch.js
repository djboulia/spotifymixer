/**
 *
 * This class handles searching for tracks on Spotify.
 *
 * @param {Object} spotifyApi initialized Spotify module to use for API calls
 */

const TrackSearch = function (spotifyApi) {
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .replace(/[\&]/g, 'and') // replace '&' with 'and'
      .replace(/[^\w\s]/g, '') // remove punctuation
      .trim();
  };

  const artistMatches = (track, artist) => {
    trackArtist = normalizeString(track.artists[0].name);
    searchArtist = normalizeString(artist);

    // ensure that the track artist matches the provided artist
    // initially I tried to match the track title as well, but that proved problematic
    // since many tracks have similar but not identical titles on iheart radio vs. spotify
    // e.g 'Moves Like Jagger' vs. 'Moves Like Jagger - Studio Version'
    if (trackArtist === searchArtist) {
      return true;
    }

    // lots of edge cases like "The Smashing Pumpkins" vs. "Smashing Pumpkins",
    // "The Jimi Hendrix Experience" vs. "Jimi Hendrix", ".38 Special" vs. "38 Special"
    // see if one of the artists is a substring of the other
    if (trackArtist.includes(searchArtist) || searchArtist.includes(trackArtist)) {
      console.log('fuzzy artist search:: ' + searchArtist, ' track artist: ' + trackArtist);
      return true;
    }

    return false;
  };

  // this was an attempt to get a better/more consistent track match from the spotify search
  // it didn't work well, so I left it in as a reference
  const titleMatches = (trackList, title) => {
    let difference = 100;
    let bestFitTrack = undefined;

    if (trackList.length === 0) {
      return undefined;
    }

    for (const track of trackList) {
      const trackTitle = normalizeString(track.name);
      const searchTitle = normalizeString(title);

      // exact match wins, return immediately
      if (trackTitle === searchTitle) {
        return track;
      } else {
        // otherwise, scan all entries for a close match
        if (trackTitle.includes(searchTitle) || searchTitle.includes(trackTitle)) {
          // the track title is a substring of the search title or vice versa

          // look for "remaster" in the track title and prefer that
          if (trackTitle.includes('remaster') || trackTitle.includes('remastered')) {
            bestFitTrack = track;
            difference = 0; // best match, no difference
          }

          // return the track with the least difference in length as "best fit"
          if (
            bestFitTrack === undefined ||
            Math.abs(trackTitle.length - searchTitle.length) < difference
          ) {
            bestFitTrack = track;
            difference = Math.abs(trackTitle.length - searchTitle.length);
          }
        }
      }
    }

    console.log('Fuzzy title match: ' + title, ' track: ' + bestFitTrack.name);
    console.log('These were the title choices ', trackList.map((t) => t.name).join(', '));
    return bestFitTrack;
  };

  /**
   * return a single spotify track that best matches the provided title and artist
   *
   * @param {string} title
   * @param {string} artist
   * @returns a track object or undefined if no match is found
   */
  this.findTrack = async (title, artist) => {
    const query = `track:"${title}" artist:"${artist}"`;
    const options = { limit: 10 };
    const results = await spotifyApi.searchTracks(query, options);
    const tracks = results.body.tracks.items;

    const artistTracks = [];

    // the spotify search results don't seem to be deterministic,
    // so sometimes we get different results for the same query
    // we look for all artist matches first, then look at best match
    // for the title

    // build a list of tracks tha match the artist
    for (const track of tracks) {
      if (artistMatches(track, artist)) {
        // console.log(`Track matched: ${track.name} by ${track.artists[0].name}`);
        artistTracks.push(track);
      }
    }

    if (artistTracks.length === 0) {
      console.log(`No artist matches found for search ${title}, ${artist} tracks`, tracks);
      return undefined;
    }

    // see comment above
    // return titleMatches(artistTracks, title) || artistTracks[0];
    return artistTracks[0];
  };
};

module.exports = TrackSearch;
