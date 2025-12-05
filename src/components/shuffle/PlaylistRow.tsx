export const PlaylistRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-foreground/25 flex flex-row items-center justify-between border-b py-2">
      {children}
    </div>
  );
};
