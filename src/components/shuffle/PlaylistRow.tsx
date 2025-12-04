export const PlaylistRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-spotify-700 flex flex-row items-center justify-between border-b py-2">
      {children}
    </div>
  );
};
