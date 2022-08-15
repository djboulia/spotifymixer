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
    this.playList = "";

    /** 
     * return an JSON string with the current shuffle status
     */
    this.json = function () {
        return JSON.stringify(this.obj());
    }

    this.status = function() {
       return ({
            inProgress: this.inProgress,
            shuffled: this.shuffled,
            total: this.total,
            artists: this.artists,
            playList: this.playList,
        });
    }

    /**
     * reset progress to complete
     */
    this.complete = function () {
        this.inProgress = false;
        this.shuffled = 0;
        this.total = 0;
        this.artists = [];
        this.playList = "";
    }

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
        this.playList = "";
    };

    this.setPlaylist = function (name) {
        this.playList = name;
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
     * start a shuffle with progress updates
     * 
     * @param {Object} spotifyApi 
     * @param {String} playlistId 
     */
    this.shuffle = function (spotifyApi, playListId) {
        const self = this;
        self.start();

        /**
         * callback function for updating progress as we re-order tracks
         * @param {Number} shuffled tracks shuffled so far
         * @param {Number} total total number of tracks
         */
        const updateShuffleProgress = function (shuffled, total) {
            console.log("updateShuffleProgress " + shuffled);
            self.setShuffled(shuffled);
        }

        const mixer = new Mixer(spotifyApi);

        mixer.getName(playListId)
            .then(function (name) {
                self.setPlaylist(name);
            })

        mixer.mixTracks(playListId)
            .then(function (result) {

                self.setArtists(result.artists);
                self.setTotal(result.before.length);

                mixer.reorderPlaylist(playListId, result.before, result.after, updateShuffleProgress)
                    .then(function () {
                        // go back and look at this playlist to verify it's in the right order
                        mixer.getTracks(playListId)
                            .then(function (data) {
                                const tracks = data.tracks;

                                if (TrackUtils.identicalTrackLists(result.after, tracks)) {
                                    console.log("Track lists match!");
                                } else {
                                    console.log("expected: ");
                                    TrackUtils.printTracks(result.after);
                                    console.log("got: ");
                                    TrackUtils.printTracks(tracks);
                                }
                                self.complete();
                            }, function (err) {
                                console.log("Error: ", err);
                                self.complete();
                            })
                    }, function (err) {
                        console.log("Error: ", err);
                        self.complete();
                    })
            }, function (err) {
                console.log("Error: ", err);
                self.complete();
            });
    };
};

module.exports = ShuffleProgress;