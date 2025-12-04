import { redirect } from "next/navigation";

import { getSpotifyServerSession } from "~/util/spotifyauth";
import * as Spotify from "~/app/server-actions/spotify";
import { ShuffleMultiple } from "~/components/ShuffleMultiple";
import { ErrorPage } from "~/components/ErrorPage";

export default async function ShuffleMultiplePage() {
  let error: string | null = null;
  const session = await getSpotifyServerSession();
  console.log("ShuffleMultiple session: ", session);
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
      <ShuffleMultiple user={session.user} playlists={playlists} />
    </main>
  );
}
