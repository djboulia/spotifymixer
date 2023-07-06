var PlayList = require('./playlist');
var TrackUtils = require('./trackutils');

const LogLevel = {
  ERROR: 1,
  INFO: 2,
  DEBUG: 3,
};

const logger = {
  logLevel: LogLevel.ERROR, // change this to enable more logging output

  error: function (...args) {
    if (this.logLevel >= LogLevel.ERROR) {
      console.log(...args);
    }
  },

  info: function (...args) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(...args);
    }
  },

  debug: function (...args) {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(...args);
    }
  },
};

/**
 * This class implements the shuffle algorithm.  It sorts by artist first,
 * randomizes the songs for that artist, then lays out the tracks roughly
 * spaced out so that you don't hear the same artist back to back.  This
 * repeats with other artists in decreasing frequency.  Finally one hit wonders
 * are combined, randomized and used to fill in any gaps in the play list.
 *
 * @param {Object} spotifyApi a configured SpotifyApi with a valid access token
 */
var Mixer = function (spotifyApi) {
  this.snapshot_id = null;

  this.getPlayListDetails = function (playListId) {
    const playList = new PlayList(spotifyApi);
    return playList.getDetails(playListId);
  };

  this.getTracks = function (playListId) {
    const playList = new PlayList(spotifyApi);
    return playList.getTracks(playListId);
  };

  /**
   * takes an object where each property is an artist name and each
   * value is the array of tracks associated with this artist.
   *
   * Sorts based on number of tracks and returns an array of the
   * sorted values.
   *
   * @param {Object} stats
   */
  var sortStats = function (stats) {
    const arrayStats = [];
    const singles = [];

    for (prop in stats) {
      if (stats[prop].length > 1) {
        logger.info('artist ' + prop + ' has ' + stats[prop].length + ' songs');
        arrayStats.push({
          artist: prop,
          tracks: stats[prop],
        });
      } else {
        // combine single track artists
        singles.push(stats[prop][0]);
      }
    }

    arrayStats.sort(function (a, b) {
      if (a.tracks.length < b.tracks.length) {
        return 1;
      } else if (a.tracks.length > b.tracks.length) {
        return -1;
      } else {
        return 0;
      }
    });

    // shuffle and layout single artists last

    if (singles.length > 0) {
      TrackUtils.shuffle(singles);

      arrayStats.push({
        artist: '[singles]',
        tracks: singles,
      });
    }

    return arrayStats;
  };

  /**
   * we define a "frame" as the section of the playlist that this track
   * can fall into.  The frame size is calculated by dividing this artist's
   * number of tracks by the total playlist size.  This spaces out the
   * artist's songs across the playlist so that we avoid hearing the same
   * artist back to back.  So if there are 100 tracks total and this artist
   * has 10 songs in the playlist, then we have 10 "frames" where no more
   * than one of this artist's songs are placed.
   *
   * This walks the list looking for an open slot in
   * the frame. We take a random number as a starting point so that
   * tracks don't follow a strict pattern.  In the event we don't find
   * a spot within the frame, we insert this track and remove an empty
   * track somewhere else.
   *
   * @param {Array} list the list to place this track in
   * @param {Number} start index to start with
   * @param {Number} frameSize size of frame to search
   * @param {Object} track track to insert
   * @param {Number} rando random seed to start to lay out this track
   */
  var placeInFrame = function (list, start, frameSize, track, rando) {
    // first try to pick a random number in the back half of the frame
    logger.info('start ' + start + ', frameSize ' + frameSize + ', rando ' + rando);

    // walk back from this number to the start of the frame to find
    // first available slot
    for (let i = rando; i >= start; i--) {
      if (!list[i]) {
        list[i] = track;
        return list;
      }
    }

    // random didn't work, just try to find an empty slot
    // walk this frame looking for an empty spot
    for (let i = start; i < start + frameSize; i++) {
      if (!list[i]) {
        list[i] = track;
        return list;
      }
    }

    // if there are no spots left in frame, insert ourselves
    list.splice(rando, 0, track);

    // now go look for an open spot to delete
    for (let i = 0; i < list.length; i++) {
      if (!list[i]) {
        logger.debug('Inserting at ' + rando + ' and removing at ' + i + ' ', track.track.name);

        list.splice(i, 1);
        return list;
      }
    }

    return list;
  };

  /**
   * Seed this frame with a higher random number
   *
   * @param {Array} list the list to place this track in
   * @param {Number} start index to start with
   * @param {Number} frameSize size of frame to search
   * @param {Object} track track to insert
   */
  var placeHighInFrame = function (list, start, frameSize, track) {
    // first try to pick a random number in the back half of the frame
    const rando = start + (frameSize - Math.floor(Math.random() * Math.floor(frameSize / 2))) - 1;

    return placeInFrame(list, start, frameSize, track, rando);
  };

  /**
   * Seed this frame with a lower random number
   *
   * @param {Array} list the list to place this track in
   * @param {Number} start index to start with
   * @param {Number} frameSize size of frame to search
   * @param {Object} track track to insert
   */
  var placeLowInFrame = function (list, start, frameSize, track) {
    // first try to pick a random number in the first half of the frame
    const rando = Math.floor(Math.random() * Math.floor(frameSize / 2)) + start;

    return placeInFrame(list, start, frameSize, track, rando);
  };

  /**
   * This returns the "to be" playlist order as an array.
   *
   * @param {Array} sortedStats
   * @returns an array with the mixed playlist
   */
  var buildPlaylist = function (sortedStats) {
    // first figure out how big the track list is
    let total = 0;
    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];
      total += stat.tracks.length;
    }

    const mixList = new Array(total);

    let low = true;

    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];

      // shuffle the tracks for this artist so we get
      // a different order each time
      if (stat.tracks.length > 1) {
        TrackUtils.shuffle(stat.tracks);
      }

      let frameStart = 0;
      const frameSize = Math.floor(total / stat.tracks.length);
      let remainder = total % stat.tracks.length;

      // distribute the tracks for this artist throughout the frame
      for (let j = 0; j < stat.tracks.length; j++) {
        const track = stat.tracks[j];
        const currentFrameSize = remainder > 0 ? frameSize + 1 : frameSize;

        if (low) {
          placeLowInFrame(mixList, frameStart, currentFrameSize, track);
        } else {
          placeHighInFrame(mixList, frameStart, currentFrameSize, track);
        }

        frameStart += currentFrameSize;
        remainder--;
      }

      low = !low;
    }

    return mixList;
  };

  /**
   * catalog the tracks by artist so we can figure out how to lay out
   * a properly mixed playlist
   *
   * @param {Array} tracks array of tracks objects
   */
  this.getMixedTrackList = function (playListId) {
    const self = this;
    logger.debug('mixtracks snapshot_id = ' + self.snapshot_id);

    return new Promise(function (resolve, reject) {
      const playList = new PlayList(spotifyApi);

      playList.getTracks(playListId).then(
        function (result) {
          // save the snapshot state for this playList to avoid concurrent
          // update issues
          logger.debug(
            'mixer.getTracks playListId ' + playListId + ' snapshot_id : ' + result.snapshot_id,
          );
          self.snapshot_id = result.snapshot_id;
          const tracks = result.tracks;

          const stats = {};

          logger.info('Found  ' + tracks.length + ' tracks in playlist');
          for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];

            // logger.info('Retrieved track name:', track.track.name);
            // logger.info('Retrieved track artist:', track.track.artists);

            const artists = track.track.artists;
            if (artists.length > 1) {
              logger.error(
                'Warning: more than one artist in this track. Using first one in this list: ',
                artists,
              );
            }
            const artist = artists[0].name;
            // logger.info('Found artist name:', artist);

            const tracklist = stats[artist] ? stats[artist] : [];
            tracklist.push(track);

            stats[artist] = tracklist;
          }

          logger.info('Found total of ' + tracks.length + ' tracks');

          const sortedStats = sortStats(stats);

          // logger.info("sorted stats: ", sortedStats);

          const mixList = buildPlaylist(sortedStats);
          TrackUtils.printTracks(mixList);

          logger.info('Original track list: ');
          TrackUtils.printTracks(tracks);

          // summarize the sorted stats and return those
          const artistStats = [];
          for (let i = 0; i < sortedStats.length; i++) {
            const stat = sortedStats[i];
            artistStats.push({
              artist: stat.artist,
              length: stat.tracks.length,
            });
          }

          resolve({
            before: tracks,
            after: mixList,
            artists: artistStats,
          });
        },
        function (err) {
          logger.error('Something went wrong!', err);
          reject(err);
        },
      );
    });
  };

  var reorderNextTrack = function (playListId, from, to, snapshot_id, i, progressCallback) {
    return new Promise(function (resolve, reject) {
      if (i >= to.length) {
        resolve(to);
      } else {
        // process the current track
        const track = to[i];
        logger.debug('Position ' + i + '. Placing track ' + track.track.name);

        // find this track in the from list
        const index = TrackUtils.findTrackIndex(track, from);
        logger.debug('Found track ' + track.track.name + ' at ' + index);

        if (progressCallback) {
          // if supplied, call the callback function to update progress
          progressCallback(i + 1, to.length);
        }

        if (index === i) {
          logger.debug(
            'Got lucky! track already in order.  No action required. ',
            track.track.name,
          );

          // process the next one
          reorderNextTrack(playListId, from, to, snapshot_id, i + 1, progressCallback).then(
            function (result) {
              resolve(to);
            },
            function (err) {
              reject(err);
            },
          );
        } else if (index >= 0 && index < from.length) {
          // do the move of the track to its new position
          const playList = new PlayList(spotifyApi);

          playList.reorderTrack(playListId, index, i, snapshot_id).then(
            function (body) {
              snapshot_id = body.snapshot_id;

              // update the local from array to match
              TrackUtils.moveTrack(from, index, i);
              logger.debug('Moved track at ' + index + ' to before ' + i);

              // process the next one
              reorderNextTrack(playListId, from, to, snapshot_id, i + 1, progressCallback).then(
                function (result) {
                  resolve(to);
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
        } else {
          logger.error("Error: couldn't find track!");
          reject("Couldn't find track!");
        }
      }
    });
  };

  /**
   * reorder the play list
   *
   * @param {String} playListId
   * @param {Array} from original play list order
   * @param {Array} to new playlist order
   */
  this.reorderPlaylist = function (playListId, from, to, progressCallback) {
    const snapshot_id = this.snapshot_id;

    return new Promise(function (resolve, reject) {
      reorderNextTrack(playListId, from, to, snapshot_id, 0, progressCallback).then(
        function (result) {
          logger.info('Final re-ordered track list: ');
          TrackUtils.printTracks(from);

          resolve(result);
        },
        function (err) {
          reject(err);
        },
      );
    });
  };
};

module.exports = Mixer;
