var ShuffleProgress = require('./shuffleprogress');

/**
 * 
 * Keep track of the shuffles in progress across various user sessions.
 * Used for the UI callback to show a shuffle progress bar
 * 
 */
var ShuffleState = function () {
    this.sessions = [];

    /**
     * Track progress for a new session
     * 
     * @param {Object} session 
     * @returns 
     */
    this.add = function(session) {
        const shuffleProgress = new ShuffleProgress();
        this.sessions[session.access_token] = shuffleProgress;
        return shuffleProgress;
    };

    /**
     * Get progress for an existing session
     * 
     * @param {Object} session 
     * @returns 
     */
     this.get = function(session) {
        return this.sessions[session.access_token];
    };

    /**
     * Stop tracking progress for this session
     * 
     * @param {Object} session 
     * @returns 
     */
     this.remove = function(session) {
        this.sessions[session.access_token] = undefined;
    }
};

module.exports = ShuffleState;