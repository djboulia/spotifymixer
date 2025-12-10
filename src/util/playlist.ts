/**
 *
 * This class manipulates a playlist using the SpotifyApi
 * Getting the track list and reordering tracks
 *
 * @param {Object} spotifyApi initialized Spotify module to use for API calls
 */
import * as TrackUtils from "./trackutils";
import type SpotifyWebApi from "spotify-web-api-node";
import type { PlayListDetails } from "~/models/playlist";

const RETRY_NUMBER = 10; // number of retries to attempt
const RETRY_DELAY = 10; // number of milliseconds beteween retries

type SpotifyApiError = {
  statusCode: number;
  headers: Record<string, string>;
  message: string;
};
export class PlayList {
  spotifyApi: SpotifyWebApi;

  constructor(spotifyApi: SpotifyWebApi) {
    this.spotifyApi = spotifyApi;
  }

  getOwnedPlayLists = async () => {
    const dataMe = await this.spotifyApi.getMe().catch((err) => {
      console.error("Unable to get user information!", err);
      throw err;
    });
    const me = dataMe.body;
    console.log("Found user", me.display_name);

    const ownedItems = [];
    let offset = 0;
    const limit = 50;
    let done = false;

    while (!done) {
      const dataPlaylist = await this.spotifyApi
        .getUserPlaylists({ offset, limit })
        .catch((err: SpotifyApiError) => {
          console.error("Unable to get playlists!", err);
          if (err.statusCode === 429) {
            const retryAfter = parseInt(err.headers["retry-after"] ?? "1", 10);
            if (retryAfter > 60 * 60) {
              console.log(
                `Rate limited! Retry after ${Math.round(retryAfter / 60 / 60)} hours...`,
              );
            } else {
              console.log(`Rate limited! Retry after ${retryAfter} seconds...`);
            }
          }
          throw err;
        });

      const playlist = dataPlaylist.body;
      const allItems = playlist.items;

      for (const item of allItems) {
        if (item?.owner.id === me.id) {
          ownedItems.push(item);
        } else {
          console.log("skipping unowned playlist ", item?.name);
        }
      }

      console.log("Total playlists: ", playlist.total);
      if (playlist.total > offset + limit) {
        offset += limit;
        console.log("Retrieving next chunk of playlists at offset " + offset);
      } else {
        console.log("No more playlists to retrieve");
        done = true;
      }
    }

    console.log("Found " + ownedItems.length + " owned playlists");
    // console.log('Owned playlists: ', JSON.stringify(ownedItems, null, 2));
    return ownedItems;
  };

  /**
   * Get the information about a playlist
   *
   * @param {String} playListId
   * @returns
   */
  getDetails = async (playListId: string) => {
    // Get the authenticated user
    // Get a user's playlists
    const data = await this.getPlaylistWithRetries(playListId).catch((err) => {
      console.log("Something went wrong in getPlaylist!", err);
      throw err;
    });

    const details: PlayListDetails = { name: undefined, img: undefined };
    details.name = data.body.name;
    details.img = data.body.images.length > 0 ? data?.body?.images[0]?.url : "";

    console.log("Retrieved playlist ", details);

    // have all of the tracks, just return
    return details;
  };

  async getNextTrackChunk(
    playListId: string,
    offset: number,
    limit: number,
    total: number,
    tracks: SpotifyApi.PlaylistTrackObject[],
  ): Promise<SpotifyApi.PlaylistTrackObject[]> {
    // Get the authenticated user
    // Get a user's playlists
    const start = offset + limit;
    console.log(
      "getNextChunks: getting chunk of size: " +
        limit +
        " with offset " +
        start,
    );

    const data = await this.spotifyApi
      .getPlaylistTracks(playListId, {
        limit: limit,
        offset: start,
      })
      .catch((err) => {
        console.log(
          "Something went wrongo in getNextTrackChunk getPlaylistTracks!",
          err,
        );
        throw err;
      });

    // console.log('Retrieved next chunk of playlists', data.body);

    const chunktracks = data.body.items;

    tracks = tracks.concat(chunktracks);

    console.log("Tracks size after chunk: " + tracks.length);

    const hasNext = data.body.next != null ? true : false;

    console.log("getNextTrackChunk hasNext: " + hasNext);

    if (hasNext) {
      const nextOffset = data.body.offset;
      const nextLimit = data.body.limit;

      console.log("next chunk: offset " + nextOffset + " limit " + nextLimit);

      // still more, recursively go for next chunk
      const nextTracks = await this.getNextTrackChunk(
        playListId,
        nextOffset,
        nextLimit,
        total,
        tracks,
      ).catch((err) => {
        console.log(
          "Something went wrongo in getNextTrackChunk recursive call!",
          err,
        );
        throw err;
      });

      return nextTracks;
    } else {
      // done retrieving, go back
      return tracks;
    }
  }

  private async getPlaylistWithRetries(playListId: string) {
    console.log("getPlaylistWithRetries for playlist id: " + playListId);

    // [07/17/2022] djb began receiving 502 errors semi randomly from this API call
    //                  to avoid it, I put in a retry loop
    for (let i = 0; i < RETRY_NUMBER; i++) {
      const data = await this.spotifyApi
        .getPlaylist(playListId)
        .catch((err) => {
          console.log(`Attempt ${i + 1} failed in getPlaylist!`, err);
          return undefined;
        });

      if (data) return data; // exit retry loop if successful

      if (i < RETRY_NUMBER - 1) {
        // need to do retries, implement a delay between each retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        console.log("tracks retry number " + (i + 1));
      }
    }

    // all retries failed, throw error
    throw new Error(
      `getPlaylistWithRetries failed after ${RETRY_NUMBER} retries!`,
    );
  }

  //
  // the Spotify REST API limits the max number of
  // tracks per call, so for large playlists we need to retrieve
  // the tracks in chunks.  Our getTracks implementation
  // does the chunking behind the scenes to return a full
  // track list
  //
  async getTracks(playListId: string) {
    const data = await this.getPlaylistWithRetries(playListId).catch((err) => {
      console.log("Something went wrong in getPlaylist!", err);
      throw err;
    });

    const tracks = data.body.tracks.items;
    const limit = data.body.tracks.limit;
    const offset = data.body.tracks.offset;
    const total = data.body.tracks.total;

    console.log("Retrieved playlist with total of " + total + " tracks");
    console.log("snapshot_id: ", data.body.snapshot_id);
    const snapshot_id = data.body.snapshot_id;

    if (offset + limit < total) {
      // more tracks to retrieve, do that here

      const nextTracks = await this.getNextTrackChunk(
        playListId,
        offset,
        limit,
        total,
        tracks,
      ).catch((err) => {
        console.log("Something went wrong in getPlaylist!", err);
        throw err;
      });

      return { snapshot_id: snapshot_id, tracks: nextTracks };
    } else {
      // have all of the tracks, just return
      return { snapshot_id: snapshot_id, tracks: tracks };
    }
  }

  private async reorderTracksInPlaylistWithRetries(
    playListId: string,
    from: number,
    to: number,
    options: { range_length: number; snapshot_id: string },
  ) {
    console.log(
      "reorderTracksInPlaylistWithRetries for playlist id: " + playListId,
    );

    // [07/17/2022] djb began receiving 502 errors semi randomly from this API call
    //                  to avoid it, I put in a retry loop
    for (let i = 0; i < RETRY_NUMBER; i++) {
      const data = await this.spotifyApi
        .reorderTracksInPlaylist(playListId, from, to, options)
        .catch((err) => {
          console.log(
            `Attempt ${i + 1} failed in reorderTracksInPlaylist!`,
            err,
          );

          return undefined;
        });

      if (data) return data; // exit retry loop if successful

      if (i < RETRY_NUMBER - 1) {
        // retrying, implement a delay between each retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        console.log("tracks retry number " + (i + 1));
      }
    }

    // all retries failed, throw error
    throw new Error(
      `reorderTracksInPlaylistWithRetries failed after ${RETRY_NUMBER} retries!`,
    );
  }

  async reorderTrack(
    playListId: string,
    from: number,
    to: number,
    snapshot_id: string,
  ) {
    console.log(
      `reorderTrack:  ${playListId} ${from} -> ${to} with snapshot_id: ${snapshot_id} `,
    );

    // Get the authenticated user
    // Get a user's playlists
    // console.log('calling reorder track with snapshot_id: ', snapshot_id);

    const options = { range_length: 1, snapshot_id: snapshot_id };
    const data = await this.reorderTracksInPlaylistWithRetries(
      playListId,
      from,
      to,
      options,
    ).catch((err) => {
      // [07/17/2022] djb began receiving 502 errors semi randomly from this API call
      //                  to avoid it, I put in a retry loop if the first call fails
      console.log("Something went wrong in reorderTracksInPlaylist!", err);
      throw err;
    });

    // debug
    // console.log('new snapshot_id', data.body.snapshot_id);

    // self.dumpTracks(playListId, from, to)
    //   .then(function (result) {
    return data.body;
    // })
  }

  async dumpTracks(playListId: string, from: number, to: number) {
    console.log("dump after reordering track " + from + " to " + to);

    const data = await this.getTracks(playListId).catch((err) => {
      console.log("Something went wrong in dumpTracks!", err);
      throw err;
    });

    const snapshot_id = data?.snapshot_id;
    const tracks = data?.tracks;

    console.log("current track list for snapshot " + snapshot_id + ": ");
    TrackUtils.printTracks(tracks);
    return true;
  }

  /**
   *
   * @param {string} playListId
   * @param {string[]} tracks an array of track URIs to add to the playlist
   */
  async addTracks(playListId: string, tracks: string[]) {
    // maximum of 100 tracks can be added at once
    const chunkSize = 100;
    for (let i = 0; i < tracks.length; i += chunkSize) {
      const chunk = tracks.slice(i, i + chunkSize);
      await this.spotifyApi
        .addTracksToPlaylist(playListId, chunk)
        .catch((err) => {
          console.error("Error adding tracks to playlist:", err);
        });
    }
    console.log(`Added ${tracks.length} tracks to playlist ` + playListId);
  }
}
