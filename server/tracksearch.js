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

  const trackMatches = (track, _title, artist) => {
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
    console.log('fuzzy search: artist: ' + searchArtist, ' track artist: ' + trackArtist);
    if (trackArtist.includes(searchArtist) || searchArtist.includes(trackArtist)) {
      return true;
    }

    return false;
  };

  /**
   * return a single spotify track that best matches the provided title and artist
   *
   * @param {string} title
   * @param {string} artist
   * @returns a track object or undefined if no match is found
   */
  this.findTrack = async (title, artist) => {
    const query = `track=${title}&artist=${artist}`;
    const options = { limit: 10 };
    const results = await spotifyApi.searchTracks(query, options);

    const tracks = results.body.tracks.items;
    for (track of tracks) {
      if (trackMatches(track, title, artist)) {
        // console.log(`Track matched: ${track.name} by ${track.artists[0].name}`);
        return track;
      } else {
        console.log(
          `Track not matched: expected ${title} got ${track.name}, expected ${artist} got ${track.artists[0].name}`,
        );
      }
    }

    console.log(`No matches found for search ${title}, ${artist} tracks`, tracks);
    return undefined;
  };
};

module.exports = TrackSearch;
