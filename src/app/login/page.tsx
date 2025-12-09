import Login from "~/components/auth/Login";
import { getSpotifyServerSession } from "~/util/auth/spotifyauth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSpotifyServerSession();

  console.log("LoginPage session: ", session);
  if (session) {
    redirect("/");
  }

  return <Login />;
}
