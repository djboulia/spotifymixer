/**
 * Encapsulates the the status of a shuffle in progress.
 *
 * states:
 * inProgress - true or false.
 *          if inProgress is true, shuffled will indicate how
 *          many have been shuffled.
 *          total is the total to be shuffled
 */

import type SpotifyWebApi from "spotify-web-api-node";
import { Mixer } from "./mixer";
import type { MixerCategoryStats, ShuffProgressStatus } from "~/models/shuffle";
import * as TrackUtils from "./trackutils";
import type { PlayListDetails } from "~/models/playlist";

export class ShuffleProgress {
  inProgress = false;
  shuffled = 0;
  total = 0;
  categories: MixerCategoryStats[] = [];
  playList: PlayListDetails | undefined = undefined;
  multiple: { current: number; total: number } | undefined = undefined;

  /**
   * return an JSON string with the current shuffle status
   */
  json() {
    return JSON.stringify(this.status());
  }

  status(): ShuffProgressStatus {
    return {
      inProgress: this.inProgress,
      shuffled: this.shuffled,
      total: this.total,
      categories: this.categories,
      playList: this.playList,
      multiple: this.multiple,
    };
  }

  /**
   * reset progress to complete
   */
  complete() {
    this.inProgress = false;
    this.shuffled = 0;
    this.total = 0;
    this.categories = [];
    this.playList = undefined;
    this.multiple = undefined;
  }

  /**
   * begin a new shuffle
   *
   * @param {Number} total number of tracks to shuffle
   */
  start() {
    this.inProgress = true;
    this.shuffled = 0;
    this.total = 0;
    this.categories = [];
    this.playList = undefined;
    this.multiple = undefined;
  }

  setMultiple(current: number, total: number) {
    this.multiple = {
      current: current,
      total: total,
    };
  }

  setPlayList(details: PlayListDetails | undefined) {
    this.playList = details;
  }

  /**
   * set the most popular categories in this shuffle
   *
   * @param {Array} categories array of category names and track counts
   */
  setCategories(categories: MixerCategoryStats[]) {
    this.categories = categories;
  }

  /**
   * update the shuffle count
   *
   * @param {Number} shuffled number of tracks to shuffle
   */
  setShuffled(shuffled: number) {
    this.shuffled = shuffled;
  }

  /**
   * update the shuffle count
   *
   * @param {Number} total number of tracks to shuffle
   */
  setTotal(total: number) {
    this.total = total;
  }

  /**
   * base playlist shuffle returns a promise. used as the core
   * shuffle function for both single shuffle and shuffle of
   * multiple playlists
   *
   * @param {Object} spotifyApi
   * @param {String} playListId
   * @returns Promise which resolves when shuffle is complete or rejects on error
   */
  async shufflePlayList(spotifyApi: SpotifyWebApi, playListId: string) {
    try {
      /**
       * callback function for updating progress as we re-order tracks
       * @param {Number} shuffled tracks shuffled so far
       * @param {Number} total total number of tracks
       */
      const updateShuffleProgress = (shuffled: number) => {
        // console.log('updateShuffleProgress ' + shuffled);
        this.setShuffled(shuffled);
      };

      const mixer = new Mixer(spotifyApi);

      this.setPlayList(await mixer.getPlayListDetails(playListId));

      const result = await mixer.getMixedTrackList(playListId);

      this.setCategories(result.categories);
      this.setTotal(result.before.length);
      await mixer.reorderPlaylist(
        playListId,
        result.before,
        result.after,
        updateShuffleProgress,
      );

      // go back and look at this playlist to verify it's in the right order
      const data = await mixer.getTracks(playListId);
      const tracks = data.tracks;

      if (TrackUtils.identicalTrackLists(result.after, tracks)) {
        console.log("Track lists match!");
      } else {
        console.log("expected: ");
        TrackUtils.printTracks(result.after);
        console.log("got: ");
        TrackUtils.printTracks(tracks);
      }
    } catch (err) {
      console.error("Error during shufflePlayList: ", err);
      throw err;
    }
  }
}
