import { getSpotifyAuthRouteHandler } from "~/util/auth/spotifyauth";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = getSpotifyAuthRouteHandler();
export { handler as GET, handler as POST };
