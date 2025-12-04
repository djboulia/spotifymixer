import SpotifyWebApi from "spotify-web-api-node";
import { SpotifyAuthState, type SpotifyAuthSession } from "./spotifyauthstate";
import * as fs from "fs";

const SPOTIFY_URL = "https://accounts.spotify.com";
const TOKEN_FILE = "./spotify_tokens.json";

const sessionExpired = function (session: SpotifyAuthSession) {
  // if the session is going to expire in 5 minutes or less,
  // refresh the token
  const expires_at = (session.expires_at as unknown as number) - 5 * 60 * 1000;

  // console.log("expires_at " + expires_at + " now " + Date.now());
  return Date.now() >= expires_at;
};

/**
 *
 * handles initializing the spotify web api, including token management/refresh
 *
 * @param {Object} spotifyConfig id and secret credentials for Spotify
 * @param {String} redirectUri uri spotify will use for the callback phase
 */
export class SpotifyApi {
  authState = new SpotifyAuthState();

  redirectUri: string;
  spotifyConfig: {
    clientId: string;
    clientSecret: string;
  };

  constructor(
    spotifyConfig: { clientId: string; clientSecret: string },
    redirectUri: string,
  ) {
    this.spotifyConfig = spotifyConfig;
    this.redirectUri = redirectUri;
  }

  private getSpotifyCredentials(session: SpotifyAuthSession) {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      redirectUri: this.redirectUri,
      clientId: this.spotifyConfig.clientId,
      clientSecret: this.spotifyConfig.clientSecret,
    };
  }

  async refreshToken(session: SpotifyAuthSession, spotifyApi: SpotifyWebApi) {
    const data = await spotifyApi.refreshAccessToken();
    console.log("refreshAccessToken: ", data.body);

    const access_token = data.body.access_token;
    const expires_in = data.body.expires_in;

    spotifyApi.setAccessToken(access_token);

    // update our session state with new info
    session.access_token = access_token;
    session.expires_in = expires_in;
    session.expires_at = Date.now() + expires_in * 1000;

    return spotifyApi;
  }

  /**
   * returns an initialized spotify API, refreshing access tokens behind the
   * scenes if they have expired
   *
   * @param {Object} session
   * @returns the initialized spotifyApi
   */
  async getSpotifyApi(session: SpotifyAuthSession) {
    if (!session) {
      throw new Error("invalid session");
    }

    const credentials = this.getSpotifyCredentials(session);
    const spotifyApi = new SpotifyWebApi(credentials);

    if (sessionExpired(session)) {
      // go get a refreshed token
      console.log("session expired, refreshing token");
      await this.refreshToken(session, spotifyApi);

      console.log(
        "returning with refreshed access token ",
        spotifyApi.getAccessToken(),
      );
    }

    // console.log('returning with access token ', spotifyApi.getAccessToken());
    return spotifyApi;
  }

  getAuthOptions(code: string) {
    const authOptions = {
      url: SPOTIFY_URL + "/api/token",
      form: {
        code: code,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            this.spotifyConfig.clientId + ":" + this.spotifyConfig.clientSecret,
          ).toString("base64"),
      },
      json: true,
    };

    return authOptions;
  }

  /**
   * Set the token state in the session.  We expect body to contain
   * the access and refresh token information
   *
   * @param {Object} session this user's session
   * @param {Object} body returned spotify object holding token info
   */
  setToken(
    session: SpotifyAuthSession,
    body: {
      access_token: string | undefined;
      refresh_token: string | undefined;
      expires_in: number | undefined;
    },
  ) {
    const access_token = body.access_token,
      refresh_token = body.refresh_token,
      expires_in = body.expires_in;

    console.log("got access token, expires in " + expires_in + " seconds");

    session.access_token = access_token;
    session.refresh_token = refresh_token;
    session.expires_at = Date.now() + (expires_in ?? 0) * 1000;

    // store the credentials in a file for next time
    fs.writeFileSync(
      TOKEN_FILE,
      JSON.stringify(
        {
          access_token: access_token,
          refresh_token: refresh_token,
          expires_in: expires_in,
          expires_at: session.expires_at,
        },
        null,
        2,
      ),
    );
  }

  // look for previously stored auth info and add to the session
  setStoredToken(session: SpotifyAuthSession) {
    // read the token from the file
    try {
      const data = fs.readFileSync(TOKEN_FILE, "utf8");
      const token = JSON.parse(data) as {
        access_token: string;
        refresh_token: string;
        expires_at: number;
      };

      console.log("setting context with stored token: ", token);
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.expires_at = token.expires_at;

      return true;
    } catch (err) {
      console.error("Error reading token file:", err);
      return false;
    }
  }

  /**
   * Set up the authorization state and build the spotify url to request authorization.
   * When spotify calls back, it will send back the 'state' key so we can ensure we're
   * matching authorization requests to the right user account.
   *
   * @param {Object} session this user's session
   * @returns a url
   */
  initAuthorization(session: SpotifyAuthSession) {
    this.authState.init(session);

    // your application requests authorization
    const scope =
      "user-read-email user-read-private playlist-read-private playlist-modify-private playlist-modify-public";
    console.log("scopes: ", scope);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.spotifyConfig.clientId,
      scope: scope,
      redirect_uri: this.redirectUri,
      state: this.authState.get(session) ?? "",
    }).toString();

    return SPOTIFY_URL + "/authorize?" + params;
  }

  /**
   * validate that the state sent back by Spotify matches our current state
   *
   * @param {Object} session
   * @param {String} state state returned from Spotify callback
   * @returns true if the state is valid, false otherwise
   */
  isValidAuthState = (session: SpotifyAuthSession, state: string) => {
    const storedState = this.authState.get(session) ?? null;

    return state === null || state !== storedState ? false : true;
  };

  /**
   * make the call to spotify to get an access token.  when Spotify called back
   * from the initial authorization request it provided a code.  we use that
   * to get the access token
   *
   * @param {Object} session
   * @param {String} code returned from Spotify
   */
  async getAccessToken(session: SpotifyAuthSession, code: string) {
    const authOptions = this.getAuthOptions(code);
    // reset the state since we're completing the authorization process
    this.authState.uninit(session);

    const result = await fetch(authOptions.url, {
      method: "POST",
      headers: authOptions.headers,
      body: new URLSearchParams(authOptions.form as Record<string, string>),
    });

    if (!result.ok) {
      throw new Error(
        `Failed to get access token: ${result.status} ${result.statusText}`,
      );
    }

    const body = (await result.json()) as SpotifyAuthSession;
    this.setToken(session, body);
    const spotifyApi = await this.get(session);
    const data = await spotifyApi.getMe();
    console.log("Authenticated as user " + data.body.display_name);
    return data.body.display_name;
  }

  /**
   * Make sure we've gone through the auth process and have an access token
   *
   * @param {Object} session
   * @returns true if an access token exists, false otherwise
   */
  isAuthenticated(session: SpotifyAuthSession) {
    return session.access_token ? true : false;
  }

  /**
   * return an initialized spotifyApi which can be used to make calls to
   * the authenticated user's spotify account.
   *
   * @param {Object} session
   * @returns the initialized api
   */
  get(session: SpotifyAuthSession) {
    return this.getSpotifyApi(session);
  }
}
