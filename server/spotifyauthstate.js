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

const AUTH_STATE_KEY = 'spotify_auth_state';

/**
 * manage the spotify authorization state in this user's session
 */
const SpotifyAuthState = function () {
  this.init = function (session) {
    const state = generateRandomString(16);
    session[AUTH_STATE_KEY] = state;
  };

  this.get = function (session) {
    return session[AUTH_STATE_KEY];
  };

  this.uninit = function (session) {
    session[AUTH_STATE_KEY] = undefined;
  };
};

module.exports = SpotifyAuthState;
