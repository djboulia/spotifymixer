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

var express = require('express'); // Express web server framework
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');

require("dotenv").config();

const serverConfig = {
    clientUrl: (process.env.CLIENT_URL) ? process.env.CLIENT_URL : "",
    serverUrl: (process.env.SERVER_URL) ? process.env.SERVER_URL : ""
}

const spotifyConfig = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
}

var ServerApi = require('./ServerApi.js');

const app = express();

app.use(cors())

app.use(express.static(path.join(__dirname, '..', 'client')))
    .use(cookieParser());


const serverApi = new ServerApi(app);
serverApi.init(serverConfig, spotifyConfig);

// catch all other non-API calls and redirect back to our REACT app
app.get('/*', function (req, res) {
    const defaultFile = path.join(__dirname, '..', 'client', 'index.html');
    res.sendFile(defaultFile);
});

console.log('Listening on 8888');
app.listen(process.env.PORT || 8888);