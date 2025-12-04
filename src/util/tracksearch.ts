/**
 *
 * This class handles searching for tracks on Spotify.
 *
 * @param {Object} spotifyApi initialized Spotify module to use for API calls
 */

import type SpotifyWebApi from "spotify-web-api-node";

type ErrorWithStatus = Error & {
  statusCode?: number;
  headers?: Record<string, string>;
};

export class TrackSearch {
  spotifyApi: SpotifyWebApi;

  constructor(spotifyApi: SpotifyWebApi) {
    this.spotifyApi = spotifyApi;
  }

  normalizeString(str: string) {
    return str
      .toLowerCase()
      .replace(/[\&]/g, "and") // replace '&' with 'and'
      .replace(/[^\w\s]/g, "") // remove punctuation
      .trim();
  }

  artistExactMatch(track: SpotifyApi.TrackObjectFull, artist: string) {
    const trackArtist = this.normalizeString(track.artists[0]?.name ?? "");
    const searchArtist = this.normalizeString(artist);

    // ensure that the track artist matches the provided artist
    // initially I tried to match the track title as well, but that proved problematic
    // since many tracks have similar but not identical titles on iheart radio vs. spotify
    // e.g 'Moves Like Jagger' vs. 'Moves Like Jagger - Studio Version'
    if (trackArtist === searchArtist) {
      return true;
    }

    return false;
  }

  artistFuzzyMatch(track: SpotifyApi.TrackObjectFull, artist: string) {
    const trackArtist = this.normalizeString(track.artists[0]?.name ?? "");
    const searchArtist = this.normalizeString(artist);

    // lots of edge cases like "The Smashing Pumpkins" vs. "Smashing Pumpkins",
    // "The Jimi Hendrix Experience" vs. "Jimi Hendrix", ".38 Special" vs. "38 Special"
    // see if one of the artists is a substring of the other
    if (
      trackArtist.includes(searchArtist) ||
      searchArtist.includes(trackArtist)
    ) {
      return true;
    }

    return false;
  }

  // this was an attempt to get a better/more consistent track match from the spotify search
  // it didn't work well, so I left it in as a reference
  titleExactMatch(trackList: SpotifyApi.TrackObjectFull[], title: string) {
    if (trackList.length === 0) {
      return undefined;
    }

    for (const track of trackList) {
      const trackTitle = this.normalizeString(track.name);
      const searchTitle = this.normalizeString(title);

      // exact match wins, return immediately
      if (trackTitle === searchTitle) {
        return track;
      }
    }

    return undefined;
  }

  searchSpotify = async (title: string, artist: string, albumName?: string) => {
    const query =
      `"${title}" "${artist}"` + (albumName ? ` "${albumName}"` : "");
    const options = { limit: 10 };

    const results = await this.spotifyApi
      .searchTracks(query, options)
      .catch(async (error: ErrorWithStatus) => {
        if (error.statusCode === 429) {
          // Retry logic could be added here
          const retryAfter =
            (Number(error.headers?.["retry-after"]) ?? 1) * 1000;
          console.error(
            "Rate limit exceeded, retrying after delay: ",
            retryAfter,
          );
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(this.searchSpotify(title, artist, albumName));
            }, retryAfter);
          });
        }
        console.error("Error searching Spotify:", error);
        console.error("headers:", error.headers, error.statusCode);
        return { body: { tracks: { items: [] } } };
      });

    const tracks = results.body.tracks?.items;
    return tracks;
  };

  searchTracks = async (title: string, artist: string, albumName?: string) => {
    const tracks = await this.searchSpotify(title, artist, albumName);
    if ((tracks?.length ?? 0) > 0) {
      return tracks;
    }

    // chop off the text in parentheses
    const titleWithoutParentheses = title.replace(/\s*\(.*?\)\s*$/, "");
    console.log(
      `No tracks found for search ${title}, ${artist}, changing title to ${titleWithoutParentheses}`,
    );

    const tracksNoParens = await this.searchSpotify(
      titleWithoutParentheses,
      artist,
      albumName,
    );

    return tracksNoParens;
  };

  /**
   * return a single spotify track that best matches the provided title and artist
   *
   * @param {string} title
   * @param {string} artist
   * @param {string} albumName optional
   * @returns a track object or undefined if no match is found
   */
  async findTrack(
    title: string,
    artist: string,
    albumName: string | undefined = undefined,
  ) {
    const tracks = await this.searchTracks(title, artist, albumName);

    const artistTracks: SpotifyApi.TrackObjectFull[] = [];

    // the spotify search results don't seem to be deterministic,
    // so sometimes we get different results for the same query
    // we look for all artist matches first, then look at best match
    // for the title

    // build a list of tracks tha match the artist
    for (const track of tracks ?? []) {
      if (this.artistExactMatch(track, artist)) {
        // console.log(`Track matched: ${track.name} by ${track.artists[0]?.name}`);
        artistTracks.push(track);
      } else {
        if (this.artistFuzzyMatch(track, artist)) {
          // console.log(`Fuzzy track match: ${track.name} by ${track.artists[0]?.name}`);
          // see if we have any prior exact matches

          const priorExactMatch = artistTracks.find((t) =>
            this.artistExactMatch(t, artist),
          );
          if (!priorExactMatch) {
            console.log(
              `no exact match found for ${artist}  adding fuzzy match`,
              track.artists[0]?.name,
            );
            artistTracks.push(track);
          }
        }
      }
    }

    if (artistTracks.length === 0) {
      const printTracks = tracks?.map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        uri: t.uri,
      }));

      console.log(
        `No artist matches found for search ${title}, ${artist} tracks`,
        JSON.stringify(printTracks, null, 2),
      );

      // try to match by title
      const track = this.titleExactMatch(tracks ?? [], title);
      if (track) {
        console.log(
          `No artist, but found track by title: ${track.name} by ${track.artists[0]?.name}`,
        );
      }
      return track;
    }

    return artistTracks[0];
  }
}
