import { redirect } from "next/navigation";

import { getSpotifyServerSession } from "~/util/spotifyauth";
import RadioSync from "~/components/RadioSync";

export default async function RadioSyncPage() {
  const session = await getSpotifyServerSession();
  console.log("RadioSync session: ", session);
  if (!session) {
    return redirect("/login");
  }

  return (
    <main>
      <RadioSync />
    </main>
  );
}
