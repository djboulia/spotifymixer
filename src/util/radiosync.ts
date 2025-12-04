/**
 *
 * Take a radio station from iheart radio and sync it with a Spotify playlist
 *
 * @param {Object} spotifyApi initialized Spotify module to use for API calls
 */
import { PlayList } from "./playlist";
import { TrackSearch } from "./tracksearch";
import { sameTitle } from "./title";
import { sameArtist, sameArtistInList } from "./artist";
import type SpotifyWebApi from "spotify-web-api-node";
import { type SpotifyTrackWithSearch } from "~/models/playlist";

type RadioTrack = {
  title: string;
  artist: { artistName: string };
};

type BasicTrack = {
  name: string | undefined;
  artists: string[] | undefined;
};

const NUM_STATION_TRACKS = 250;

export class RadioSync {
  spotifyPlayList: PlayList;
  spotifySearch: TrackSearch;
  spotifyApi: SpotifyWebApi;

  constructor(spotifyApi: SpotifyWebApi) {
    this.spotifyPlayList = new PlayList(spotifyApi);
    this.spotifySearch = new TrackSearch(spotifyApi);
    this.spotifyApi = spotifyApi;
  }

  // look in the station track list for title and artist
  inStationList = (title: string, artist: string, tracks: RadioTrack[]) => {
    return tracks.some(
      (track) =>
        sameTitle(track.title, title) &&
        sameArtist(track.artist?.artistName, artist),
    );
  };

  /**
   * Use iheart radio's API to fetch the recently played tracks for a radio station
   *
   * @param {string} stationId - the iheart radio station ID
   * @param {number} numTracks - the number of tracks to fetch
   * @returns {Promise<Array>} - a promise that resolves to an array of recently played tracks
   */
  fetchStationRecentlyPlayed = async (stationId: string, numTracks: number) => {
    const response = await fetch(
      `https://webapi.radioedit.iheart.com/graphql?operationName=GetCurrentlyPlayingSongs&variables=%7B%22slug%22%3A%22${stationId}%22%2C%22paging%22%3A%7B%22take%22%3A${numTracks}%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22386763c17145056713327cddec890cd9d4fea7558efc56d09b7cd4167eef6060%22%7D%7D`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recently played tracks");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();
    const tracks: RadioTrack[] =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (data?.data?.sites?.find?.stream?.amp?.currentlyPlaying
        ?.tracks as RadioTrack[]) || [];

    // remove any duplicate tracks from the radio station list
    // this can happen for popular tracks that are played multiple times
    const uniqueTracks: RadioTrack[] = [];
    tracks.forEach((track) => {
      if (
        !this.inStationList(track.title, track.artist?.artistName, uniqueTracks)
      ) {
        uniqueTracks.push(track);
      } else {
        console.log(
          `Duplicate track found in station list: ${track.title} by ${track.artist?.artistName}`,
        );
      }
    });

    return uniqueTracks;
  };

  inPlayList = (title: string, artist: string, tracks: BasicTrack[]) => {
    // try basic match first
    if (
      tracks.some(
        (track) => track.name === title && track.artists?.includes(artist),
      )
    )
      return true;

    // no perfect match, normalize the titles and check again
    for (const track of tracks) {
      // if artist doesn't match, skip
      if (!sameArtistInList(track.artists ?? [], artist)) continue;

      if (sameTitle(track.name ?? "", title)) {
        console.log(
          `Found track in playlist: ${track.name} by ${track.artists?.[0]} (search: ${title} by ${artist})`,
        );
        return true;
      }
    }

    return false;
  };

  findTrack = async (title: string, artist: string) => {
    const track = await this.spotifySearch.findTrack(title, artist);

    // store the original track title and artist for later use
    return {
      ...track,
      searchTitle: title,
      searchArtist: artist,
    };
  };

  /**
   * search spotify for tracks from the radio station
   *
   * @param {Array} stationTracks - radio station tracks
   * @returns an array of spotify track objects
   */
  searchSpotifyTracks = async (
    stationTracks: RadioTrack[],
  ): Promise<SpotifyTrackWithSearch[]> => {
    // search for new tracks in spotify
    const searchResults: SpotifyTrackWithSearch[] = [];
    for (const track of stationTracks) {
      console.log(
        `Searching for track: ${track.title} by ${track.artist.artistName}`,
      );
      searchResults.push(
        (await this.findTrack(
          track.title,
          track.artist.artistName,
        )) as SpotifyTrackWithSearch,
      );
    }
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
  getUniqueStationTracks = (
    tracks: BasicTrack[],
    stationTracks: RadioTrack[],
  ) => {
    const uniqueTracks: RadioTrack[] = [];

    stationTracks.forEach((stationTrack) => {
      if (!stationTrack.artist?.artistName) {
        console.error(
          `No artist for track: ${JSON.stringify(stationTrack, null, 2)}`,
        );
        return;
      }

      if (
        !this.inPlayList(
          stationTrack.title,
          stationTrack.artist.artistName,
          tracks,
        )
      ) {
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
  getUniqueSpotifyTracks = (
    tracks: BasicTrack[],
    searchResults: SpotifyTrackWithSearch[],
  ) => {
    const uniqueTracks: SpotifyTrackWithSearch[] = [];
    if (!searchResults || searchResults.length === 0) {
      return uniqueTracks;
    }

    for (const searchTrack of searchResults) {
      if (
        !searchTrack ||
        (!searchTrack.name && !searchTrack.artists?.[0]?.name)
      ) {
        console.log(`No track found`);
        continue;
      }

      // there is a chance the artist/title didn't match exactly between iheartradio and spotify,
      // so we look up each track in the spotify playlist to see if the same track is already there
      if (
        !this.inPlayList(
          searchTrack.name,
          searchTrack.artists?.[0]?.name ?? "",
          tracks,
        )
      ) {
        console.log(
          "Unique track:",
          searchTrack.name +
            " by " +
            searchTrack.artists?.[0]?.name +
            " (search critera: " +
            searchTrack.searchTitle +
            ", " +
            searchTrack.searchArtist +
            ")",
        );
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
  findNewTracks = async (
    playlistTracks: {
      snapshot_id: string;
      tracks: SpotifyApi.PlaylistTrackObject[];
    },
    stationTracks: RadioTrack[],
  ) => {
    // build a list of the title and artists for each track in the playlist
    const tracks = playlistTracks.tracks.map((track) => {
      const artistNames = track.track?.artists.map((artist) => artist.name);
      return {
        name: track.track?.name,
        artists: artistNames,
      };
    });
    // console.log('tracks ', tracks);

    const uniqueStationTracks = this.getUniqueStationTracks(
      tracks,
      stationTracks,
    );

    const searchResults = await this.searchSpotifyTracks(uniqueStationTracks);

    // double check that the search results are unique and not already in the playlist
    // this can happen if a track name/artist isn't matched from the radio station version
    // but is found in the spotify search
    const uniqueSpotifyTracks = this.getUniqueSpotifyTracks(
      tracks,
      searchResults,
    );
    return uniqueSpotifyTracks;
  };

  async sync(
    stationId: string,
    playListId: string,
    numTracks = NUM_STATION_TRACKS,
  ) {
    const playlistTracks = await this.spotifyPlayList.getTracks(playListId);
    const stationTracks = await this.fetchStationRecentlyPlayed(
      stationId,
      numTracks,
    );
    console.log(`found ${stationTracks.length} stationTracks `);

    const newTracks = await this.findNewTracks(playlistTracks, stationTracks);

    if (newTracks.length === 0) {
      console.log("No new tracks to add");
      return [];
    }

    // convert the tracks to spotify URIs for adding to the playlist
    const trackUris = newTracks.map((track) => `spotify:track:${track.id}`);
    console.log(
      "Adding " + trackUris.length + " new tracks to playlist " + playListId,
    );
    await this.spotifyPlayList.addTracks(playListId, trackUris);

    // show what we added
    return newTracks;
  }
}
