"use client";

import { signOut } from "next-auth/react";

export default function Logout() {
  return (
    <div className="mt-4">
      <button
        className="text-spotify-300 cursor-pointer"
        onClick={() => signOut()}
      >
        Log out of Spotify
      </button>
    </div>
  );
}
