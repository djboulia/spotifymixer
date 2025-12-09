/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length: number): string => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export type SpotifyAuthSession = {
  expires_at?: number | string;
  access_token: string | undefined;
  refresh_token: string | undefined;
  expires_in: number | undefined;
  spotify_auth_state: string | undefined;
};

/**
 * manage the spotify authorization state in this user's session
 */
export class SpotifyAuthState {
  init = function (session: SpotifyAuthSession) {
    const state = generateRandomString(16);
    session.spotify_auth_state = state;
  };

  get = function (session: SpotifyAuthSession) {
    return session.spotify_auth_state;
  };

  uninit = function (session: SpotifyAuthSession) {
    session.spotify_auth_state = undefined;
  };
}
