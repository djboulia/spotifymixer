/**
 * Encapsulates the the status of a shuffle in progress.
 * 
 * states:
 * inProgress - true or false. 
 *          if inProgress is true, shuffled will indicate how
 *          many have been shuffled.
 *          total is the total to be shuffled
 */

var ShuffleProgress = function() {
    this.inProgress = false;
    this.shuffled = 0;
    this.total = 0;
    this.artists = [];
    this.playList = "";

    /** 
     * return an JSON string with the current shuffle status
     */
    this.json = function() {
        return JSON.stringify({
            inProgress: this.inProgress,
            shuffled : this.shuffled,
            total : this.total,
            artists : this.artists,
            playList : this.playList,
        });
    }

    /**
     * reset progress to complete
     */
    this.complete = function() {
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
    this.start = function( ) {
        this.inProgress = true;
        this.shuffled = 0;
        this.total = 0;
        this.artists = [];
        this.playList = "";
    };

    this.setPlaylist = function(name) {
        this.playList = name;
    };

    /**
     * set the most popular artists in this shuffle
     * 
     * @param {Array} artists array of artist names and track counts
     */
    this.setArtists = function(artists) {
        this.artists = artists;
    };

    /**
     * update the shuffle count
     * 
     * @param {Number} shuffled number of tracks to shuffle
     */
    this.setShuffled = function( shuffled ) {
        this.shuffled = shuffled;
    };

    /**
     * update the shuffle count
     * 
     * @param {Number} total number of tracks to shuffle
     */
    this.setTotal = function( total ) {
        this.total = total;
    };
};

module.exports = ShuffleProgress;