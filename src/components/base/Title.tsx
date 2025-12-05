export const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-sidebar-foreground p-4 text-xl font-bold">
      {children}
    </h1>
  );
};
