/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var cors = require('cors')
var path = require('path');
var request = require('request'); // "Request" library
var session = require("express-session");
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var PlayList = require('./playlist');
var Mixer = require('./mixer');
var TrackUtils = require('./trackutils');
var ShuffleProgress = require('./shuffleprogress');
const {
    access
} = require('fs');

require("dotenv").config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var client_url = (process.env.CLIENT_URL) ? process.env.CLIENT_URL : ""; // 'http://localhost:3000';
var server_url = (process.env.SERVER_URL) ? process.env.SERVER_URL : ""; // 'http://localhost:8888';
var redirect_uri = server_url + '/api/auth/spotify/callback';

console.log("server_url ", server_url);
console.log("client_url ", client_url);
console.log("redirect_uri ", redirect_uri);

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var sessionExpired = function (session) {
    // if the session is going to expire in 5 minutes or less,
    // refresh the token
    const expires_at = session.expires_at - (5 * 60 * 1000);

    console.log("expires_at " + expires_at + " now " + Date.now());
    return (Date.now() >= expires_at);
};

async function refreshToken(session, spotifyApi) {
    const data = await spotifyApi.refreshAccessToken();
    console.log("refreshAccessToken: ", data.body);

    const access_token = data.body['access_token'];
    const expires_in = data.body['expires_in'];

    spotifyApi.setAccessToken(access_token);

    // update our session state with new info
    session.access_token = access_token;
    session.expires_in = expires_in;
    session.expires_at = Date.now() + (expires_in * 1000);

    return spotifyApi;
}

async function getSpotifyApi(session) {
    const spotifyApi = new SpotifyWebApi({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        redirectUri: redirect_uri,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    });

    if (sessionExpired(session)) {
        // go get a refreshed token
        console.log("session expired, refreshing token");
        await refreshToken(session, spotifyApi);
    }

    console.log("returning with access token ", spotifyApi.getAccessToken())
    return spotifyApi;
};

var stateKey = 'spotify_auth_state';

let shuffleProgress = new ShuffleProgress();

var app = express();

app.use(cors())

app.use(express.static(path.join(__dirname, '..', 'client')))
    .use(cookieParser());

app.use(
    session({
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true
    })
);

app.get('/api/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = "user-read-email user-read-private playlist-read-private playlist-modify-private playlist-modify-public";
    console.log("scopes: ", scope);

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/api/authenticated', function (req, res) {
    let response = false;
    if (req.session.access_token) {
        response = true;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

app.get('/api/spotify/me', function (req, res) {
    getSpotifyApi(req.session)
        .then(function (spotifyApi) {
            return spotifyApi.getMe();
        })
        .then(function (data) {
            console.log("Found user " + data.body.display_name);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data.body));
        }, function (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500);
            res.send(JSON.stringify(err));
        });
});

app.get('/api/spotify/playlists', function (req, res) {
    getSpotifyApi(req.session)
        .then(function (spotifyApi) {
            const playList = new PlayList(spotifyApi);

            return playList.getOwnedPlayLists()
        })
        .then(function (data) {
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
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(list));
        }, function (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500);
            res.send(JSON.stringify(err));
        });
});

app.get('/api/spotify/progress', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(shuffleProgress.json());
});

/**
 * callback function for updating progress as we re-order tracks
 * @param {Number} shuffled tracks shuffled so far
 * @param {Number} total total number of tracks
 */
var updateShuffleProgress = function (shuffled, total) {
    console.log("updateShuffleProgress " + shuffled);
    shuffleProgress.setShuffled(shuffled);
}

app.get('/api/spotify/shuffle', function (req, res) {
    const playListId = req.query.playListId || null;

    shuffleProgress.start();

    getSpotifyApi(req.session)
        .then(function (spotifyApi) {
            const mixer = new Mixer(spotifyApi);

            mixer.catalogTracks(playListId)
                .then(function (result) {

                    shuffleProgress.setTotal(result.before.length);

                    mixer.reorderTracks(playListId, result.before, result.after, updateShuffleProgress)
                        .then(function (result2) {
                            // go back and look at this playlist to verify it's in the right order
                            const playList = new PlayList(spotifyApi);
                            playList.getTracks(playListId)
                                .then(function (tracks) {
                                        if (TrackUtils.identicalTrackLists(result.after, tracks)) {
                                            console.log("Track lists match!");
                                            shuffleProgress.complete();
                                        } else {
                                            shuffleProgress.complete();
                                        }
                                    },
                                    function (err) {
                                        console.log("Error: ", err);
                                        shuffleProgress.complete();
                                    })
                        }, function (err) {
                            console.log("Error: ", err);
                            shuffleProgress.complete();
                        })
                }, function (err) {
                    console.log("Error: ", err);
                    shuffleProgress.complete();
                });
        }, function (err) {
            console.log("Error: ", err);
            shuffleProgress.complete();
        });

    res.setHeader('Content-Type', 'application/json');
    res.end(shuffleProgress.json());
});

app.get('/api/auth/spotify/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token,
                    expires_in = body.expires_in;

                console.log("got access token, expires in " + expires_in + " seconds");

                req.session.access_token = access_token;
                req.session.refresh_token = refresh_token;
                req.session.expires_in = expires_in;
                req.session.expires_at = Date.now() + (expires_in * 1000);

                getSpotifyApi(req.session)
                    .then(function(spotifyApi) {
                        return spotifyApi.getMe();
                    })
                    .then(function (data) {
                        console.log('Authenticated as user ' + data.body.display_name);
                    });

                // send back to the client after successful login
                res.redirect(client_url + '/postLogin');
            } else {
                res.redirect(client_url + '/logout');
            }
        });
    }
});

// catch all other non-API calls and redirect back to our REACT app
app.get('/*', function (req, res) {
    const defaultFile = path.join(__dirname, '..', 'client', 'index.html');
    res.sendFile(defaultFile);
});

console.log('Listening on 8888');
app.listen(process.env.PORT || 8888);