/**
 * Spotify Mixer
 * Handles all server side API calls for this application.
 * 
 * Does oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const path = require('path');

require("dotenv").config();

const serverConfig = {
    clientUrl: (process.env.CLIENT_URL) ? process.env.CLIENT_URL : "",
    serverUrl: (process.env.SERVER_URL) ? process.env.SERVER_URL : ""
}

const spotifyConfig = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
}

const ReactServer = require('./reactserver.js');
const ServerApi = require('./ServerApi.js');

const clientDir = path.join(__dirname, '..', 'client');

const server = new ReactServer(clientDir);

const serverApi = new ServerApi(server);
serverApi.init(serverConfig, spotifyConfig);

const port = process.env.PORT || 8888;
console.log(`Listening on ${port}`);
server.listen(port);