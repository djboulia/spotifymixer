import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import SpotifyWebApi from "spotify-web-api-node";

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

type Token = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} & Record<string, unknown>;

const SPOTIFY_URL = "https://accounts.spotify.com";
const scopes = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-modify-private",
  "playlist-modify-public",
].join(",");

const spotifyAuthOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: SPOTIFY_URL + "/authorize?scope=" + scopes,
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      console.log("JWT callback - token: ", token);
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        console.log("First login, storing access token");
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      } else if (Date.now() < (token as Token).expiresAt) {
        // Subsequent logins, but the `access_token` is still valid
        const timeRemaining = (token as Token).expiresAt - Date.now();
        console.log(
          `Token still valid for ${Math.floor(timeRemaining / 1000)} seconds`,
        );
        return token;
      } else {
        console.log(`Token expired - refreshing`);
        const creds = token as Token;

        const spotifyApi = new SpotifyWebApi({
          clientId: process.env.SPOTIFY_CLIENT_ID!,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
        });
        spotifyApi.setAccessToken(creds.accessToken);
        spotifyApi.setRefreshToken(creds.refreshToken);

        const data = await spotifyApi.refreshAccessToken();
        console.log("refreshAccessToken: ", data.body);

        const accessToken = data.body.access_token;
        const expiresIn = data.body.expires_in * 1000;
        const expiresAt = Date.now() + expiresIn;

        return {
          ...token,
          accessToken: accessToken,
          expiresAt: expiresAt,
        };
      }
    },

    async session({ session, token }) {
      console.log("Session callback - token: ", token);
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.expiresAt = token.expiresAt as number;
      return session;
    },
  },
};

export async function getSpotifyServerSession() {
  const session = await getServerSession(spotifyAuthOptions);
  return session;
}

export function getSpotifyAuthRouteHandler() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const handler = NextAuth(spotifyAuthOptions);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return handler;
}
