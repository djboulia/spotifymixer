/**
 * 
 * Encapsulate all of our backend server API calls
 * 
 */

const PlayList = require('./playlist');
const ShuffleState = require('./shufflestate');
const SpotifySession = require('./spotifysession');

var ServerApi = function (server) {

    // hold our shuffle state for each session
    const shuffleState = new ShuffleState();

    // handlers for our backend API entry points
    async function spotifyMe(spotifyApi) {
        const data = await spotifyApi.getMe();

        console.log("Found user " + data.body.display_name);

        return data.body;
    }

    async function spotifyPlaylists(spotifyApi) {
        const playList = new PlayList(spotifyApi);

        const data = await playList.getOwnedPlayLists();

        // go through the play list and extract what we want
        console.log("playlists: ");
        const list = [];

        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];

            // console.log("tracks: ", item.tracks);
            // console.log("images: ", item.images);
            console.log(item.name);

            list.push({
                id: item.id,
                name: item.name,
                img: (item.images.length > 0) ? item.images[0].url : "",
                total: item.tracks.total
            })

        }

        return list;
    }

    async function spotifyPlaylists(spotifyApi) {
        const playList = new PlayList(spotifyApi);

        const data = await playList.getOwnedPlayLists();

        // go through the play list and extract what we want
        console.log("playlists: ");
        const list = [];

        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];

            // console.log("tracks: ", item.tracks);
            // console.log("images: ", item.images);
            console.log(item.name);

            list.push({
                id: item.id,
                name: item.name,
                img: (item.images.length > 0) ? item.images[0].url : "",
                total: item.tracks.total
            })

        }

        return list;
    }

    async function spotifyProgress(spotifyApi, context) {
        const session = context.session
        let shuffleProgress = shuffleState.get(session);

        if (!shuffleProgress) {
            console.log("No shuffle in progress, creating new shuffle state");

            shuffleProgress = shuffleState.add(session);
        }

        return shuffleProgress.status();
    }

    async function spotifyShuffle(spotifyApi, context) {
        const session = context.session;
        const query = context.query;

        const playListId = query.playListId || null;

        // kick off a shuffle... this could take a while, so we
        // return immediately and the caller can check the state
        // via the /progress api
        const shuffleProgress = shuffleState.add(session);

        shuffleProgress.shuffle(spotifyApi, playListId);

        return shuffleProgress.status();
    }


    this.init = function (serverConfig, spotifyConfig) {

        const spotifySession = new SpotifySession(server, serverConfig, spotifyConfig);
        spotifySession.init();

        // register each entry point and their associated handlers
        spotifySession.addApi('/api/spotify/me', spotifyMe);
        spotifySession.addApi('/api/spotify/playlists', spotifyPlaylists);
        spotifySession.addApi('/api/spotify/progress', spotifyProgress);
        spotifySession.addApi('/api/spotify/shuffle', spotifyShuffle);

    };

};

module.exports = ServerApi;
