/**
 *
 * This class manipulates a playlist using the SpotifyApi
 * Getting the track list and reordering tracks
 *
 * @param {Object} spotifyApi initialized Spotify module to use for API calls
 */
var TrackUtils = require('./trackutils');

var PlayList = function (spotifyApi) {
  const RETRY_DELAY = 10; // number of milliseconds beteween retries

  this.getOwnedPlayLists = function () {
    return new Promise(function (resolve, reject) {
      // Get the authenticated user
      spotifyApi.getMe().then(
        function (data) {
          const me = data.body;
          console.log('Found user', me.display_name);

          // Get a user's playlists
          spotifyApi.getUserPlaylists({ limit: 50 }).then(
            function (data) {
              // console.log('Retrieved playlists', data.body);

              const ownedItems = [];
              const allItems = data.body.items;

              for (let i = 0; i < allItems.length; i++) {
                const item = allItems[i];
                if (item.owner.id === me.id) {
                  ownedItems.push(item);
                } else {
                  console.log('skipping unowned playlist ', item.name);
                }
              }

              resolve(ownedItems);
            },
            function (err) {
              console.log('Something went wrong!', err);
              reject(err);
            },
          );
        },
        function (err) {
          console.log('Something went wrong!', err);
          reject(err);
        },
      );
    });
  };

  /**
   * Get the information about a playlist
   *
   * @param {String} playListId
   * @returns
   */
  this.getDetails = function (playListId) {
    return new Promise(function (resolve, reject) {
      // Get the authenticated user
      // Get a user's playlists
      spotifyApi.getPlaylist(playListId).then(
        function (data) {
          const details = {};
          details.name = data.body.name;
          details.img = data.body.images.length > 0 ? data.body.images[0].url : '';

          console.log('Retrieved playlist ', details);

          // have all of the tracks, just return
          resolve(details);
        },
        function (err) {
          console.log('Something went wrong!', err);
          reject(err);
        },
      );
    });
  };

  var getNextTrackChunk = function (playListId, offset, limit, total, tracks) {
    return new Promise(function (resolve, reject) {
      // Get the authenticated user
      // Get a user's playlists
      const start = offset + limit;
      console.log('getNextChunks: getting chunk of size: ' + limit + ' with offset ' + start);

      spotifyApi
        .getPlaylistTracks(playListId, {
          limit: limit,
          offset: start,
        })
        .then(
          function (data) {
            // console.log('Retrieved next chunk of playlists', data.body);

            const chunktracks = data.body.items;

            tracks = tracks.concat(chunktracks);

            console.log('Tracks size after chunk: ' + tracks.length);

            const hasNext = data.body.next != null ? true : false;

            console.log('getNextTrackChunk hasNext: ' + hasNext);

            if (hasNext) {
              const nextOffset = data.body.offset;
              const nextLimit = data.body.limit;

              console.log('next chunk: offset ' + nextOffset + ' limit ' + nextLimit);

              // still more, recursively go for next chunk
              getNextTrackChunk(playListId, nextOffset, nextLimit, total, tracks).then(
                function (tracks) {
                  resolve(tracks);
                },
                function (err) {
                  console.log('Something went wrongo in getNextTrackChunk!', err);
                  reject(err);
                },
              );
            } else {
              // done retrieving, go back
              resolve(tracks);
            }
          },
          function (err) {
            console.log('Something went wrongo in getNextTrackChunk!', err);
            reject(err);
          },
        );
    });
  };

  var retryTracks = function (spotifyApi, delay, playListId) {
    return new Promise(function (resolve, reject) {
      setTimeout(
        (arg) => {
          console.log('retryTracks: backed off by ' + delay + ' and trying again..');

          spotifyApi.getPlaylist(playListId).then(
            function (data) {
              const tracks = data.body.tracks.items;
              const limit = data.body.tracks.limit;
              const offset = data.body.tracks.offset;
              const total = data.body.tracks.total;

              console.log('Retrieved playlist with total of ' + total + ' tracks');
              console.log('snapshot_id: ', data.body.snapshot_id);
              const snapshot_id = data.body.snapshot_id;

              if (offset + limit < total) {
                // more tracks to retrieve, do that here

                getNextTrackChunk(playListId, offset, limit, total, tracks).then(
                  function (tracks) {
                    resolve({ snapshot_id: snapshot_id, tracks: tracks });
                  },
                  function (err) {
                    console.log('Something went wrong in retryTracks getNextTrackChunk!', err);
                    reject(err);
                  },
                );
              } else {
                // have all of the tracks, just return
                resolve({ snapshot_id: snapshot_id, tracks: tracks });
              }
            },
            function (err) {
              console.log('Something went wrong in retryTracks!', err);
              reject(err);
            },
          );
        },
        delay,
        null,
      );
    });
  };

  /**
   *
   * [07/19/2022] the Spotify API started randomly returning 500/502 errors to various
   *              API calls.  added a retry mechanism to avoid failing each time we
   *              receive these.
   *
   */
  async function doTracksRetries(spotifyApi, playListId) {
    // do a retry 10 times (max)
    var finished = false;
    for (var i = 0; i < 10; i++) {
      finished = true;

      console.log('tracks retry number ' + (i + 1));
      const data = await retryTracks(spotifyApi, RETRY_DELAY, playListId).catch((err) => {
        console.log('retry error! ', err);
        finished = false;
      });

      if (finished) {
        // console.log('retry data ', data);
        return data;
      }
    }

    throw new Error('Reorder track failed after 10 retries!');
  }

  //
  // the Spotify REST API limits the max number of
  // tracks per call, so for large playlists we need to retrieve
  // the tracks in chunks.  Our getTracks implementation
  // does the chunking behind the scenes to return a full
  // track list
  //
  this.getTracks = function (playListId) {
    const self = this;

    return new Promise(function (resolve, reject) {
      spotifyApi.getPlaylist(playListId).then(
        function (data) {
          const tracks = data.body.tracks.items;
          const limit = data.body.tracks.limit;
          const offset = data.body.tracks.offset;
          const total = data.body.tracks.total;

          console.log('Retrieved playlist with total of ' + total + ' tracks');
          console.log('snapshot_id: ', data.body.snapshot_id);
          const snapshot_id = data.body.snapshot_id;

          if (offset + limit < total) {
            // more tracks to retrieve, do that here

            getNextTrackChunk(playListId, offset, limit, total, tracks).then(
              function (tracks) {
                resolve({ snapshot_id: snapshot_id, tracks: tracks });
              },
              function (err) {
                console.log('Something went wrong in getPlaylist!', err);

                doTracksRetries(spotifyApi, playListId)
                  .then((data) => {
                    resolve(data);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              },
            );
          } else {
            // have all of the tracks, just return
            resolve({ snapshot_id: snapshot_id, tracks: tracks });
          }
        },
        function (err) {
          console.log('Something went wrong in getPlaylist!', err);

          doTracksRetries(spotifyApi, playListId)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
  };

  var retryReorderTrack = function (spotifyApi, delay, playListId, from, to, snapshot_id) {
    return new Promise(function (resolve, reject) {
      console.log('calling retryReorderTrack with snapshot_id: ', snapshot_id);

      const options = { range_length: 1, snapshot_id: snapshot_id };

      setTimeout(
        (arg) => {
          console.log('backed off by ' + delay + ' and trying again..');

          spotifyApi.reorderTracksInPlaylist(playListId, from, to, options).then(
            function (data) {
              // debug
              // console.log('setting new snapshot_id', data.body.snapshot_id);
              // snapshot_id = data.body.snapshot_id;
              resolve(data);
            },
            function (err) {
              console.log('Something went wrong in retry of reorderTracksInPlaylist!', err);

              reject(err);
            },
          );
        },
        delay,
        null,
      );
    });
  };

  /**
   *
   * [07/19/2022] the Spotify API started randomly returning 500/502 errors to various
   *              API calls.  added a retry mechanism to avoid failing each time we
   *              receive these.
   *
   */
  async function doReorderRetries(spotifyApi, playListId, from, to, snapshot_id) {
    // do a retry 10 times (max)
    var finished = false;
    for (var i = 0; i < 10; i++) {
      finished = true;

      console.log('reorder retry number ' + (i + 1));
      const data = await retryReorderTrack(
        spotifyApi,
        RETRY_DELAY,
        playListId,
        from,
        to,
        snapshot_id,
      ).catch((err) => {
        console.log('retry error! ', err);
        finished = false;
      });

      if (finished) {
        // console.log('retry data ', data);
        return data;
      }
    }

    throw new Error('Reorder track failed after 10 retries!');
  }

  this.reorderTrack = function (playListId, from, to, snapshot_id) {
    const self = this;

    return new Promise(function (resolve, reject) {
      // Get the authenticated user
      // Get a user's playlists
      console.log('calling reorder track with snapshot_id: ', snapshot_id);

      const options = { range_length: 1, snapshot_id: snapshot_id };
      spotifyApi.reorderTracksInPlaylist(playListId, from, to, options).then(
        function (data) {
          // debug
          console.log('new snapshot_id', data.body.snapshot_id);

          // self.dumpTracks(playListId, from, to)
          //   .then(function (result) {
          resolve(data.body);
          // })
        },
        function (err) {
          // [07/17/2022] djb began receiving 502 errors semi randomly from this API call
          //                  to avoid it, I put in a retry loop if the first call fails
          console.log('Something went wrong in reorderTracksInPlaylist!', err);

          // self.dumpTracks(playListId, from, to)
          //   .then(function (result) {
          doReorderRetries(spotifyApi, playListId, from, to, snapshot_id)
            .then((data) => {
              console.log('new snapshot_id', data.body.snapshot_id);
              resolve(data.body);
            })
            .catch((err) => {
              reject(err);
            });
          // })
        },
      );
    });
  };

  this.dumpTracks = function (playListId, from, to) {
    const self = this;

    return new Promise(function (resolve, reject) {
      console.log('dump after reordering track ' + from + ' to ' + to);

      self.getTracks(playListId).then(
        function (data) {
          const snapshot_id = data.snapshot_id;
          const tracks = data.tracks;

          console.log('current track list for snapshot ' + snapshot_id + ': ');
          TrackUtils.printTracks(tracks);
          resolve(true);
        },
        function (err) {
          console.log('Error: ', err);
          resolve(true);
        },
      );
    });
  };
};

module.exports = PlayList;
