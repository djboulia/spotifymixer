/**
 * 
 * Handle session state and authorization for Spotify
 * 
 */
const SpotifyApi = require("./spotifyapi");

var SpotifySession = function (server, serverConfig, spotifyConfig) {
    const CALLBACK_PATH = '/api/auth/spotify/callback';

    const client_url = serverConfig.clientUrl;
    const server_url = serverConfig.serverUrl;
    const redirect_uri = server_url + CALLBACK_PATH;

    console.log("server_url ", server_url);
    console.log("client_url ", client_url);
    console.log("redirect_uri ", redirect_uri);

    const spotifyApi = new SpotifyApi(spotifyConfig, redirect_uri);

    /**
     * initialize the Spotify session by adding handlers for login, logout, 
     * authorization handling and session state
     */
    this.init = function () {

        async function login(context) {
            // login begins a multi-step process with Spotify OAuth. first step
            // is to send an authorization request.  Spotify will then call
            // redirect_uri to complete the authorization

            const authUrl = spotifyApi.initAuthorization(context.session);
            return server.redirect(authUrl);
        }

        async function authenticated(context) {
            const response = spotifyApi.isAuthenticated(context.session);

            console.log(`authenticated returning ${response}`);
            return response;
        }

        async function callback(context) {

            // Spotify will callback this entry point after we try to authorize
            // the user.  This will finish the authorization and give us a Spotify 
            // access token to be used in subsequent Spotify API calls

            var code = context.query.code || null;
            var state = context.query.state || null;

            if (!spotifyApi.isValidAuthState(context.session, state)) {
                const params = new URLSearchParams({
                    error: 'state_mismatch'
                }).toString();

                console.log('params: ' + params);
                return server.redirect('/#' + params);
            } else {
                await spotifyApi.getAccessToken(context.session, code)
                    .catch((err) => {
                        return server.redirect(client_url + '/logout');
                    })

                server.login(context.session);

                console.log('redirecting to postLogin');
                return server.redirect(client_url + '/postLogin');
            }
        }

        async function logout(context) {
            const msg = await server.logout(context.session);

            return msg;
        }

        server.method('/api/login', 'GET', login);
        server.method('/api/authenticated', 'GET', authenticated);
        server.method(CALLBACK_PATH, 'GET', callback);
        server.method('/api/logout', 'GET', logout);
    };

    /**
     * Used to add api entry points for SpotifyMixer.  The fn provided will 
     * be called with the SpotifyApi initialized and other context 
     * such as session and query data.
     * 
     * @param {String} path the base url for this entry point
     * @param {Function} fn the function to call with SpotifyApi as the parameter
     */
    this.addApi = function (path, fn) {
        async function apiHandler(context) {
            if (!spotifyApi.isAuthenticated(context.session)) {
                throw new Error('Please authenticate with the Spotify API first');
            }

            const api = await spotifyApi.get(context.session)
                .catch((e) => {
                    throw new Error('Could not get Spotify API');
                })

            // after we've verified and initialized the API, call the function
            return fn(api, context);
        }

        server.method(path, 'GET', apiHandler);
    }
};

module.exports = SpotifySession;
