export const PlaylistRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-surface-300 flex flex-row items-center justify-between border-b py-2">
      {children}
    </div>
  );
};
