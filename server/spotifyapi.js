
var request = require('request'); // "Request" library

var SpotifyWebApi = require('spotify-web-api-node');
var SpotifyAuthState = require('./spotifyauthstate');

const SPOTIFY_URL = 'https://accounts.spotify.com';

/**
 * 
 * handles initializing the spotify web api, including token management/refresh
 * 
 * @param {Object} spotifyConfig id and secret credentials for Spotify
 * @param {String} redirectUri uri spotify will use for the callback phase
 */
var SpotifyApi = function (spotifyConfig, redirectUri) {
    const authState = new SpotifyAuthState();

    const sessionExpired = function (session) {
        // if the session is going to expire in 5 minutes or less,
        // refresh the token
        const expires_at = session.expires_at - (5 * 60 * 1000);

        console.log("expires_at " + expires_at + " now " + Date.now());
        return (Date.now() >= expires_at);
    };

    const getSpotifyCredentials = function (session) {
        return ({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            redirectUri: redirectUri,
            clientId: spotifyConfig.clientId,
            clientSecret: spotifyConfig.clientSecret
        });
    }

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

    /**
     * returns an initialized spotify API, refreshing access tokens behind the
     * scenes if they have expired
     * 
     * @param {Object} session 
     * @returns the initialized spotifyApi
     */
    async function getSpotifyApi(session) {
        if (!session) {
            throw new Error('invalid session');
        }

        const credentials = getSpotifyCredentials(session);
        const spotifyApi = new SpotifyWebApi(credentials);

        if (sessionExpired(session)) {
            // go get a refreshed token
            console.log("session expired, refreshing token");
            await refreshToken(session, spotifyApi);
        }

        console.log("returning with access token ", spotifyApi.getAccessToken())
        return spotifyApi;
    };

    const getAuthOptions = function (code) {
        const authOptions = {
            url: SPOTIFY_URL + '/api/token',
            form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(spotifyConfig.clientId + ':' + spotifyConfig.clientSecret).toString('base64'))
            },
            json: true
        };

        return authOptions;
    };

    /**
     * Set the token state in the session.  We expect body to contain
     * the access and refresh token information
     * 
     * @param {Object} session this user's session
     * @param {Object} body returned spotify object holding token info
     */
    const setToken = function (session, body) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token,
            expires_in = body.expires_in;

        console.log("got access token, expires in " + expires_in + " seconds");

        session.access_token = access_token;
        session.refresh_token = refresh_token;
        session.expires_in = expires_in;
        session.expires_at = Date.now() + (expires_in * 1000);
    };

    /**
     * Set up the authorization state and build the spotify url to request authorization.
     * When spotify calls back, it will send back the 'state' key so we can ensure we're 
     * matching authorization requests to the right user account.
     * 
     * @param {Object} session this user's session
     * @returns a url
     */
    this.initAuthorization = function(session) {
        authState.init(session);

        // your application requests authorization
        var scope = "user-read-email user-read-private playlist-read-private playlist-modify-private playlist-modify-public";
        console.log("scopes: ", scope);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: spotifyConfig.clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: authState.get(session)
        }).toString();

       return SPOTIFY_URL + '/authorize?' + params;
    };

    /**
     * validate that the state sent back by Spotify matches our current state
     * 
     * @param {Object} session 
     * @param {String} state state returned from Spotify callback
     * @returns true if the state is valid, false otherwise
     */
    this.isValidAuthState = function( session, state ) {
        var storedState = authState.get(session) || null;

        return (state === null || state !== storedState) ? false : true;
    };

    /**
     * make the call to spotify to get an access token.  when Spotify called back 
     * from the initial authorization request it provided a code.  we use that
     * to get the access token
     * 
     * @param {Object} session 
     * @param {String} code returned from Spotify
     */
    this.getAccessToken = function (session, code) {

        const self = this;

        return new Promise(function (resolve, reject) {
            const authOptions = getAuthOptions(code);

            // reset the state since we're completing the authorization process
            authState.uninit(session);

            request.post(authOptions, function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    setToken(session, body);

                    self.get(session)
                        .then(function (spotifyApi) {
                            return spotifyApi.getMe();
                        })
                        .then(function (data) {
                            console.log('Authenticated as user ' + data.body.display_name);
                            resolve(data.body.display_name);
                        });

                } else {
                    reject(error);
                }
            });
        });
    };

    /**
     * Make sure we've gone through the auth process and have an access token
     * 
     * @param {Object} session 
     * @returns true if an access token exists, false otherwise
     */
    this.isAuthenticated = function (session) {
        return (session.access_token) ? true : false;
    };

    /**
     * return an initialized spotifyApi which can be used to make calls to 
     * the authenticated user's spotify account.
     * 
     * @param {Object} session 
     * @returns the initialized api
     */
    this.get = function (session) {
        return getSpotifyApi(session);
    };

}

module.exports = SpotifyApi;
