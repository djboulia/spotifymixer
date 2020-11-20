
var PlayList = function (spotifyApi) {

    this.getOwnedPlayLists = function () {
      return new Promise(function (resolve, reject) {
        // Get the authenticated user
        spotifyApi.getMe()
          .then(function (data) {
            const me = data.body;
            console.log('Some information about the authenticated user', me);
  
            // Get a user's playlists
            spotifyApi.getUserPlaylists({limit: 50})
              .then(function (data) {
                // console.log('Retrieved playlists', data.body);

                const ownedItems = [];
                const allItems = data.body.items;

                for (let i=0; i<allItems.length; i++) {
                  const item = allItems[i];
                  if (item.owner.id === me.id) {
                    ownedItems.push(item);
                  } else {
                    console.log("skipping unowned playlist ", item.name)
                  }
                }

                data.body.items = ownedItems;
  
                resolve(data.body);
              }, function (err) {
                console.log('Something went wrong!', err);
                reject(err);
              });
  
          }, function (err) {
            console.log('Something went wrong!', err);
            reject(err);
          });
      });
  
    };
  
    var getNextTrackChunk = function (playListId, offset, limit, total, tracks) {
      return new Promise(function (resolve, reject) {
        // Get the authenticated user
        // Get a user's playlists
        const start = offset + limit;
        console.log("getNextChunks: getting chunk of size: " + limit + " with offset " + start);
  
        spotifyApi.getPlaylistTracks(
            playListId, {
              limit: limit,
              offset: start
            })
          .then(function (data) {
            // console.log('Retrieved next chunk of playlists', data.body);
  
            const chunktracks = data.body.items;
  
            tracks = tracks.concat(chunktracks);
  
            console.log("Tracks size after chunk: " + tracks.length);
  
            const hasNext = (data.body.next != null) ? true : false;
  
            console.log('getNextTrackChunk hasNext: ' + hasNext);
  
            if (hasNext) {
              const nextOffset = data.body.offset;
              const nextLimit = data.body.limit;
  
              console.log('next chunk: offset ' + nextOffset + ' limit ' + nextLimit);
  
              // still more, recursively go for next chunk
              getNextTrackChunk(playListId, nextOffset, nextLimit, total, tracks)
                .then(function (tracks) {
                  resolve(tracks);
                });
            } else {
              // done retrieving, go back
              resolve(tracks);
            }
          }, function (err) {
            console.log('Something went wrong!', err);
            reject(err);
          });
  
      });
    };
  
    this.getName = function (playListId) {
      return new Promise(function (resolve, reject) {
        // Get the authenticated user
        // Get a user's playlists
        spotifyApi.getPlaylist(playListId)
          .then(function (data) {
  
            const name = data.body.name;

            console.log('Retrieved playlist name '+ name );

            // have all of the tracks, just return
            resolve(name);
  
          }, function (err) {
            console.log('Something went wrong!', err);
            reject(err);
          });
  
      });
    };
  
    this.getTracks = function (playListId) {
      return new Promise(function (resolve, reject) {
        // Get the authenticated user
        // Get a user's playlists
        spotifyApi.getPlaylist(playListId)
          .then(function (data) {
  
            const tracks = data.body.tracks.items;
            const limit = data.body.tracks.limit;
            const offset = data.body.tracks.offset;
            const total = data.body.tracks.total;

            console.log('Retrieved playlist with total of '+ total + ' tracks');
            
            if ((offset + limit) < total) {
              // more tracks to retrieve, do that here
  
              getNextTrackChunk(playListId, offset, limit, total, tracks)
                .then(function (tracks) {
                  resolve(tracks);
                });
            } else {
              // have all of the tracks, just return
              resolve(tracks);
            }
  
          }, function (err) {
            console.log('Something went wrong!', err);
            reject(err);
          });
  
      });
    };
  
    this.reorderTrack = function (playListId, from, to) {
      return new Promise(function (resolve, reject) {
        // Get the authenticated user
        // Get a user's playlists
        const options = { "range_length" : 1 };
        spotifyApi.reorderTracksInPlaylist(playListId, from, to, options)
        .then(function(data) {
          resolve(data);
        }, function(err) {
          console.log('Something went wrong!', err);
          reject(err);
        });
      });
    };
  }
  
  module.exports = PlayList;