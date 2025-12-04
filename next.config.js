/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  allowedDevOrigins: [
    // we need to use 127.0.0.1 locally because Spotify does not accept
    // localhost as a redirect URI for OAuth.  However, the Nextjs dev server
    // uses localhost by default, so we need to explicitly allow 127.0.0.1
    "127.0.0.1",
    // not clear if we will need to do this in production
    // "spotifymixer.boulia-nc.net",
  ],
};

export default config;
