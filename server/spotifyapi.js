
var request = require('request'); // "Request" library

var SpotifyWebApi = require('spotify-web-api-node');

/**
 * 
 * handles initializing the spotify api, including token management/refresh
 * 
 * @param {Object} spotifyConfig credentials for Spotify
 */
var SpotifyApi = function (spotifyConfig, redirect_uri) {
    var sessionExpired = function (session) {
        // if the session is going to expire in 5 minutes or less,
        // refresh the token
        const expires_at = session.expires_at - (5 * 60 * 1000);

        console.log("expires_at " + expires_at + " now " + Date.now());
        return (Date.now() >= expires_at);
    };

    var getSpotifyCredentials = function (session) {
        return ({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            redirectUri: redirect_uri,
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
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
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
     * make the call to spotify to get an access token.  when Spotify calls back 
     * from the initial authorization request it provides a code.  we use that
     * to get the access token
     * 
     * @param {Object} session 
     * @param {String} code 
     */
    this.getAccessToken = function (session, code) {

        const self = this;

        return new Promise(function (resolve, reject) {
            const authOptions = getAuthOptions(code);

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

    this.get = function (session) {
        return getSpotifyApi(session);
    };

    this.isAuthenticated = function (session) {
        return (session.access_token) ? true : false;
    };
}

module.exports = SpotifyApi;
