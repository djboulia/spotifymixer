"use client";

import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

export default function Logout() {
  return (
    <div className="mt-4">
      <Button onClick={() => signOut()}>Log out of Spotify</Button>
    </div>
  );
}
