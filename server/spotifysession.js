/**
 * 
 * Handle session state and authorization for Spotify
 * 
 */
 var session = require("express-session");

 var SpotifyApi = require("./spotifyapi");

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

var JsonResponse = function () {
    this.send = function (res, obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
    };

    this.error = function (res, err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.send(JSON.stringify(err));
    };
}


var SpotifySession = function (app, serverConfig, spotifyConfig) {
    const callback_path = '/api/auth/spotify/callback';

    const client_url = serverConfig.clientUrl;
    const server_url = serverConfig.serverUrl;
    const redirect_uri = server_url + callback_path;

    console.log("server_url ", server_url);
    console.log("client_url ", client_url);
    console.log("redirect_uri ", redirect_uri);

    const stateKey = 'spotify_auth_state';
    const jsonResponse = new JsonResponse();

    const spotifyApi = new SpotifyApi(spotifyConfig, redirect_uri);

    /**
     * initialize the Spotify session by adding express handlers for login, logout, 
     * authorization handling and session state
     */
    this.init = function () {

        app.use(
            session({
                secret: "MyMiddlewareSecretSessionId",
                resave: true,
                saveUninitialized: true
            })
        );

        app.get('/api/login', function (req, res) {
            // login begins a multi-step process with Spotify OAuth. first step
            // is to send an authorization request.  Spotify will then call
            // redirect_uri to complete the authorization

            var state = generateRandomString(16);
            req.session[stateKey] = state;

            // your application requests authorization
            var scope = "user-read-email user-read-private playlist-read-private playlist-modify-private playlist-modify-public";
            console.log("scopes: ", scope);

            const params = new URLSearchParams({
                response_type: 'code',
                client_id: spotifyConfig.clientId,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
            }).toString();

            res.redirect('https://accounts.spotify.com/authorize?' + params);
        });

        app.get('/api/authenticated', function (req, res) {
            const response = spotifyApi.isAuthenticated(req.session);

            jsonResponse.send(res, response);
        });

        app.get(callback_path, function (req, res) {

            // Spotify will callback this entry point after we try to authorize
            // the user.  This will finish the authorization and give us a Spotify 
            // access token to be used in subsequent Spotify API calls

            var code = req.query.code || null;
            var state = req.query.state || null;
            var storedState = req.session[stateKey] || null;

            if (state === null || state !== storedState) {
                const params = new URLSearchParams({
                    error: 'state_mismatch'
                }).toString();

                console.log('params: ' + params);
                res.redirect('/#' + params);
            } else {
                req.session[stateKey] = undefined;

                spotifyApi.getAccessToken(req.session, code)
                    .then((result) => {
                        // redirect back to the client after successful login
                        res.redirect(client_url + '/postLogin');
                    }, (err) => {
                        res.redirect(client_url + '/logout');
                    })
            }
        });

        app.get('/api/logout', function (req, res) {

            if (req.session) {
                req.session.destroy(err => {
                    if (err) {
                        console.log("unable to log out");
                        res.status(400).send('Unable to log out')
                    } else {
                        res.send('Logout successful')
                        console.log('Logout successful')
                    }
                });
            }
        });

    };

    /**
     * Used to add api entry points for Spotify.  The fn provided will 
     * be called with the SpotifyApi initialized and other context 
     * such as session and query data.  This function handles all of the
     * boiler plate express stuff.
     * 
     * @param {String} path the base url for this entry point
     * @param {Function} fn the function to call with SpotifyApi as the parameter
     */
    this.entryPoint = function (path, fn) {
        app.get(path, function (req, res) {
            spotifyApi.get(req.session)
                .then((spotifyApi) => {
                    return fn(spotifyApi,
                        {
                            session: req.session,
                            query: req.query
                        });
                })
                .then(function (result) {
                    jsonResponse.send(res, result);
                }, function (err) {
                    jsonResponse.error(res, err);
                });
        });
    }
};

module.exports = SpotifySession;
