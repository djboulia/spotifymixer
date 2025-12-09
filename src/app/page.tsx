import { redirect } from "next/navigation";

import { getSpotifyServerSession } from "~/util/auth/spotifyauth";
import * as Spotify from "~/app/server-actions/spotify";
import { Shuffle } from "~/components/Shuffle";
import { ErrorPage } from "~/components/ErrorPage";

export default async function HomePage() {
  let error: string | null = null;

  const session = await getSpotifyServerSession();
  console.log("HomePage session: ", session);
  if (!session) {
    return redirect("/login");
  }

  console.log("session user: ", session.user);
  const playlists = await Spotify.getOwnedPlayLists().catch((err) => {
    console.error("Error fetching playlists: ", err);
    error = "Error fetching playlists ";
    return [];
  });

  if (error) {
    return <ErrorPage message={error} />;
  }

  return (
    <main>
      <Shuffle user={session.user} playlists={playlists} />
    </main>
  );
}
