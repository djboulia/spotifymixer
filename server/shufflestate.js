var ShuffleProgress = require('./shuffleprogress');

var ShuffleState = function () {
    this.sessions = [];

    this.add = function(session) {
        const shuffleProgress = new ShuffleProgress();
        this.sessions[session.access_token] = shuffleProgress;
        return shuffleProgress;
    };

    this.get = function(session) {
        return this.sessions[session.access_token];
    };

    this.remove = function(session) {
        this.sessions[session.access_token] = undefined;
    }
};

module.exports = ShuffleState;