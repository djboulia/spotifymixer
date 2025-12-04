import Logout from "~/components/auth/Logout";

export default async function LogoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1>Logout Page</h1>
      <Logout />
    </main>
  );
}
