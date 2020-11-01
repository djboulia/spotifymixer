var ShuffleProgress = function() {
    this.inProgress = false;
    this.shuffled = 0;
    this.total = 0;

    // states:
    //  inProgress - true or false.  
    //      if inProgress is true, shuffled will indicate how
    //                              many have been shuffled.
    //                              total is the total to be shuffled

    /** 
     * return an JSON string with the current shuffle status
     */
    this.json = function() {
        return JSON.stringify({
            inProgress: this.inProgress,
            shuffled : this.shuffled,
            total : this.total
        });
    }

    /**
     * reset progress to complete
     */
    this.complete = function() {
        this.inProgress = false;
        this.shuffled = 0;
        this.total = 0;
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