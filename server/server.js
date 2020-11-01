/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var session = require("express-session");
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var PlayList = require('./playlist');
var Mixer = require('./mixer');
var TrackUtils = require('./trackutils');
var ShuffleProgress = require('./shuffleprogress');

require("dotenv").config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var client_url = 'http://localhost:3000';
var server_url = 'http://localhost:8888';
var redirect_uri = server_url + '/api/auth/spotify/callback'; // Or Your redirect uri

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

var stateKey = 'spotify_auth_state';

let shuffleProgress = new ShuffleProgress();

var app = express();

app.use(express.static(__dirname + '/../client'))
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
    const spotifyApi = new SpotifyWebApi({
        accessToken: req.session.access_token,
        refreshToken: req.session.refresh_token,
        redirectUri: redirect_uri,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    });

    spotifyApi.getMe()
        .then(function (data) {
            console.log(data.body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data.body));
        }, function (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500);
            res.send(JSON.stringify(err));
        });
});

app.get('/api/spotify/playlists', function (req, res) {
    const spotifyApi = new SpotifyWebApi({
        accessToken: req.session.access_token,
        refreshToken: req.session.refresh_token,
        redirectUri: redirect_uri,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    });

    const playList = new PlayList(spotifyApi);

    playList.getOwnedPlayLists()
        .then(function (data) {
            // go through the play list and extract what we want
            const list = [];
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];

                console.log("tracks: ", item.tracks);
                console.log("images: ", item.images);

                list.push({
                    id: item.id,
                    name: item.name,
                    img: (item.images.length >0) ? item.images[0].url : "",
                    total: item.tracks.total
                })
            }
            console.log("items: ", list);
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
var updateShuffleProgress = function(shuffled, total) {
    console.log("updateShuffleProgress " + shuffled);
    shuffleProgress.setShuffled(shuffled);
}

app.get('/api/spotify/shuffle', function (req, res) {
    const playListId = req.query.playListId || null;

    const spotifyApi = new SpotifyWebApi({
        accessToken: req.session.access_token,
        refreshToken: req.session.refresh_token,
        redirectUri: redirect_uri,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    });

    shuffleProgress.start();

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
                    refresh_token = body.refresh_token;

                // var options = {
                //     url: 'https://api.spotify.com/v1/me',
                //     headers: {
                //         'Authorization': 'Bearer ' + access_token
                //     },
                //     json: true
                // };
                // // use the access token to access the Spotify Web API
                // request.get(options, function (error, response, body) {
                //     console.log(body);
                // });
                req.session.access_token = access_token;
                req.session.refresh_token = refresh_token;
                req.session.timestamp = Date.now();

                const spotifyApi = new SpotifyWebApi({
                    accessToken: req.session.access_token,
                    refreshToken: req.session.refresh_token,
                    redirectUri: redirect_uri,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET
                });

                spotifyApi.getMe()
                    .then(function (data) {
                        console.log(data.body);
                    });

                // send back to the client after successful login
                res.redirect(client_url + '/postLogin');
            } else {
                res.redirect(client_url + '/logout');
            }
        });
    }
});

console.log('Listening on 8888');
app.listen(8888);