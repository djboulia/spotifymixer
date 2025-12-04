export const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="to-spotify-800/75 from-spotify-900 flex flex-row items-center justify-between rounded-lg bg-linear-to-t px-10 py-6">
      {children}
    </div>
  );
};
