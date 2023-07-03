/**
 * Encapsulates the the status of a shuffle in progress.
 *
 * states:
 * inProgress - true or false.
 *          if inProgress is true, shuffled will indicate how
 *          many have been shuffled.
 *          total is the total to be shuffled
 */

var Mixer = require('./mixer');
var TrackUtils = require('./trackutils');

var ShuffleProgress = function () {
  this.inProgress = false;
  this.shuffled = 0;
  this.total = 0;
  this.artists = [];
  this.playList = undefined;
  this.multiple = undefined;

  /**
   * return an JSON string with the current shuffle status
   */
  this.json = function () {
    return JSON.stringify(this.obj());
  };

  this.status = function () {
    return {
      inProgress: this.inProgress,
      shuffled: this.shuffled,
      total: this.total,
      artists: this.artists,
      playList: this.playList,
      multiple: this.multiple,
    };
  };

  /**
   * reset progress to complete
   */
  this.complete = function () {
    this.inProgress = false;
    this.shuffled = 0;
    this.total = 0;
    this.artists = [];
    this.playList = undefined;
    this.multiple = undefined;
  };

  /**
   * begin a new shuffle
   *
   * @param {Number} total number of tracks to shuffle
   */
  this.start = function () {
    this.inProgress = true;
    this.shuffled = 0;
    this.total = 0;
    this.artists = [];
    this.playList = undefined;
    this.multiple = undefined;
  };

  this.setMultiple = function (current, total) {
    this.multiple = {
      current: current,
      total: total,
    };
  };

  this.setPlayList = function (details) {
    this.playList = details;
  };

  /**
   * set the most popular artists in this shuffle
   *
   * @param {Array} artists array of artist names and track counts
   */
  this.setArtists = function (artists) {
    this.artists = artists;
  };

  /**
   * update the shuffle count
   *
   * @param {Number} shuffled number of tracks to shuffle
   */
  this.setShuffled = function (shuffled) {
    this.shuffled = shuffled;
  };

  /**
   * update the shuffle count
   *
   * @param {Number} total number of tracks to shuffle
   */
  this.setTotal = function (total) {
    this.total = total;
  };

  /**
   * base playlist shuffle returns a promise. used as the core
   * shuffle function for both single shuffle and shuffle of
   * multiple playlists
   *
   * @param {Object} spotifyApi
   * @param {String} playListId
   * @returns Promise which resolves when shuffle is complete or rejects on error
   */
  this.shufflePlayList = function (spotifyApi, playListId) {
    return new Promise((resolve, reject) => {
      const self = this;

      /**
       * callback function for updating progress as we re-order tracks
       * @param {Number} shuffled tracks shuffled so far
       * @param {Number} total total number of tracks
       */
      const updateShuffleProgress = function (shuffled, total) {
        console.log('updateShuffleProgress ' + shuffled);
        self.setShuffled(shuffled);
      };

      const mixer = new Mixer(spotifyApi);

      mixer.getPlayListDetails(playListId).then(function (details) {
        self.setPlayList(details);
      });

      mixer.getMixedTrackList(playListId).then(
        function (result) {
          self.setArtists(result.artists);
          self.setTotal(result.before.length);

          mixer
            .reorderPlaylist(playListId, result.before, result.after, updateShuffleProgress)
            .then(
              function () {
                // go back and look at this playlist to verify it's in the right order
                mixer.getTracks(playListId).then(
                  function (data) {
                    const tracks = data.tracks;

                    if (TrackUtils.identicalTrackLists(result.after, tracks)) {
                      console.log('Track lists match!');
                    } else {
                      console.log('expected: ');
                      TrackUtils.printTracks(result.after);
                      console.log('got: ');
                      TrackUtils.printTracks(tracks);
                    }
                    resolve();
                  },
                  function (err) {
                    reject(err);
                  },
                );
              },
              function (err) {
                reject(err);
              },
            );
        },
        function (err) {
          reject(err);
        },
      );
    });
  };
};

module.exports = ShuffleProgress;
