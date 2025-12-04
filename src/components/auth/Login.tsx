"use client";

import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const session = useSession();
  if (session.status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1>Loading...</h1>
      </main>
    );
  }

  if (session.status === "authenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1>You are already logged in</h1>
        <p>Welcome, {session.data.user?.name}!</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1>Login Page</h1>
      <p>
        Please{" "}
        <button className="text-green-600" onClick={() => signIn("spotify")}>
          log in to Spotify
        </button>{" "}
        to access your account.
      </p>
    </main>
  );
}
